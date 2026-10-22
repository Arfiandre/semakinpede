<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Connection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use PDO;
use RuntimeException;
use Throwable;

#[Signature('database:backup {--path= : Lokasi absolut file backup baru}')]
#[Description('Membuat snapshot database SQLite atau MySQL tanpa mengubah data sumber')]
class DatabaseBackupCommand extends Command
{
    public function handle(): int
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if (! in_array($driver, ['sqlite', 'mysql', 'mariadb'], true)) {
            $this->error('Driver database belum didukung untuk backup. Migrasi harus dihentikan.');

            return Command::FAILURE;
        }

        $path = $this->option('path') ?: storage_path('app/private/backups/database-'.now()->format('Ymd-His').'-'.bin2hex(random_bytes(4)).($driver === 'sqlite' ? '.sqlite' : '.sql'));
        $previousUmask = umask(0077);

        try {
            File::ensureDirectoryExists(dirname($path), 0700);
            $directory = realpath(dirname($path));

            if ($directory === false || $this->isPublicDirectory($directory)) {
                throw new RuntimeException('Backup harus disimpan di luar direktori public.');
            }

            $path = $directory.DIRECTORY_SEPARATOR.basename($path);

            if (file_exists($path) || is_link($path)) {
                throw new RuntimeException('File tujuan sudah ada. Backup lama tidak boleh ditimpa.');
            }

            if ($driver === 'sqlite') {
                $this->backupSqlite($connection, $path);
            } else {
                $this->backupMysql($connection, $path);
            }

            if (! is_file($path) || filesize($path) === 0) {
                throw new RuntimeException('File backup kosong atau tidak tersedia.');
            }

            chmod($path, 0600);
            $this->info('Backup database berhasil: '.$path);

            return Command::SUCCESS;
        } catch (Throwable) {
            $this->error('Backup database gagal. Periksa koneksi, izin folder, ruang disk, dan ketersediaan mysqldump/mariadb-dump. Jangan lanjutkan migrasi.');

            return Command::FAILURE;
        } finally {
            umask($previousUmask);
        }
    }

    private function isPublicDirectory(string $directory): bool
    {
        $publicDirectories = [public_path()];

        foreach (config('filesystems.disks', []) as $name => $disk) {
            if (($disk['driver'] ?? null) === 'local' && ($name === 'public' || ($disk['visibility'] ?? null) === 'public')) {
                $publicDirectories[] = $disk['root'];
            }
        }

        foreach (config('filesystems.links', []) as $link => $target) {
            if (str_starts_with(str_replace('\\', '/', $link).'/', str_replace('\\', '/', public_path()).'/')) {
                $publicDirectories[] = $target;
            }
        }

        foreach (File::glob(public_path('/*')) as $entry) {
            if (is_link($entry) && is_dir($entry)) {
                $publicDirectories[] = $entry;
            }
        }

        $normalizedDirectory = str_replace('\\', '/', $directory).'/';

        foreach ($publicDirectories as $publicDirectory) {
            $resolvedDirectory = realpath($publicDirectory);

            if ($resolvedDirectory !== false && str_starts_with($normalizedDirectory, str_replace('\\', '/', $resolvedDirectory).'/')) {
                return true;
            }
        }

        return false;
    }

    private function backupSqlite(Connection $connection, string $path): void
    {
        $connection->getPdo()->exec('VACUUM INTO '.$connection->getPdo()->quote($path));
        $snapshot = new PDO('sqlite:'.$path);

        if ($snapshot->query('PRAGMA integrity_check')->fetchColumn() !== 'ok') {
            throw new RuntimeException('Verifikasi snapshot SQLite gagal.');
        }
    }

    private function backupMysql(Connection $connection, string $path): void
    {
        $configuration = $connection->getConfig();
        $command = [
            $connection->getDriverName() === 'mariadb' ? 'mariadb-dump' : 'mysqldump',
            '--single-transaction',
            '--quick',
            '--routines',
            '--triggers',
            '--events',
            '--no-tablespaces',
            '--result-file='.$path,
            '--user='.$configuration['username'],
        ];

        if (! empty($configuration['unix_socket'])) {
            $command[] = '--socket='.$configuration['unix_socket'];
        } else {
            $host = $configuration['host'] ?? '127.0.0.1';
            $command[] = '--host='.(is_array($host) ? $host[0] : $host);
            $command[] = '--port='.($configuration['port'] ?? 3306);
        }

        $command[] = '--';
        $command[] = $configuration['database'];

        $result = Process::timeout(600)
            ->env(['MYSQL_PWD' => $configuration['password'] ?? ''])
            ->quietly()
            ->run($command);

        if ($result->failed()) {
            throw new RuntimeException('Client database gagal membuat snapshot.');
        }
    }
}
