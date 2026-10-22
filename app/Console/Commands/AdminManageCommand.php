<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

#[Signature('admin:setup {--username=superadmin : Nama pengguna superadmin} {--password=SemakinPede2026! : Kata sandi superadmin} {--email=admin@semakinpede.com : Alamat email superadmin}')]
#[Description('Inisialisasi atau reset kredensial akun superadmin dan diagnosa kelolaan database')]
class AdminManageCommand extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=====================================================');
        $this->info('  SEMAKIN PEDE - Setup & Diagnosa Database Admin');
        $this->info('=====================================================');

        // 1. Diagnosa Koneksi Database
        try {
            DB::connection()->getPdo();
            $connectionName = config('database.default');
            $databaseName = config("database.connections.{$connectionName}.database");
            $this->info("✓ Koneksi Database Berhasil: [{$connectionName}] -> {$databaseName}");
        } catch (\Throwable $e) {
            $this->error("✗ Gagal terhubung ke Database: {$e->getMessage()}");

            return Command::FAILURE;
        }

        // 2. Cek Tabel-Tabel Utama
        $requiredTables = ['users', 'sessions', 'events', 'brokers', 'leads', 'site_settings', 'economic_news', 'audit_logs'];
        $missingTables = [];

        foreach ($requiredTables as $table) {
            if (! Schema::hasTable($table)) {
                $missingTables[] = $table;
            }
        }

        if (! empty($missingTables)) {
            $this->warn('! Beberapa tabel penting belum ada: '.implode(', ', $missingTables));
            $this->info('  Menjalankan migrasi database otomatis...');
            $this->call('migrate', ['--force' => true]);
        } else {
            $this->info('✓ Semua tabel aplikasi lengkap.');
        }

        // 3. Setup / Reset Akun Superadmin Utama
        $username = (string) $this->option('username');
        $password = (string) $this->option('password');
        $email = (string) $this->option('email');

        $superadmin = User::firstOrNew(['username' => $username]);
        $superadmin->name = 'Superadmin Semakin Pede';
        $superadmin->email = $email;
        $superadmin->password = Hash::make($password);
        $superadmin->save();

        $this->info('✓ Superadmin berhasil disiapkan:');
        $this->line("   - Username : <comment>{$username}</comment>");
        $this->line("   - Password : <comment>{$password}</comment>");
        $this->line("   - Email    : <comment>{$email}</comment>");

        // 4. Pastikan Akun Cadangan 'Arfiandre' Tersedia
        $arfiandre = User::firstOrNew(['username' => 'Arfiandre']);
        $arfiandre->name = 'Arfiandre';
        $arfiandre->email = 'arfiandre@semakinpede.com';
        $arfiandre->password = Hash::make('matematika');
        $arfiandre->save();

        $this->info("✓ Akun cadangan 'Arfiandre' berhasil disiapkan:");
        $this->line('   - Username : <comment>Arfiandre</comment>');
        $this->line('   - Password : <comment>matematika</comment>');

        // 5. Cek Permission File jika SQLite
        if (config('database.default') === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            if (file_exists($dbPath)) {
                $perms = substr(sprintf('%o', fileperms($dbPath)), -4);
                $isWritable = is_writable($dbPath);
                $dirWritable = is_writable(dirname($dbPath));
                $this->info("✓ Database SQLite File: {$dbPath} (Permission: {$perms})");
                if (! $isWritable || ! $dirWritable) {
                    $this->warn('! PERINGATAN: File atau folder SQLite mungkin tidak dapat ditulis oleh web server (www-data).');
                    $this->warn('  Jalankan di terminal server: sudo chmod -R 775 database && sudo chown -R $USER:www-data database');
                }
            }
        }

        // 6. Ringkasan Pengguna Terdaftar
        $this->newLine();
        $this->info('Daftar Akun Admin Terdaftar di Database:');
        $users = User::select(['id', 'username', 'email', 'name', 'created_at'])->get();
        $this->table(['ID', 'Username', 'Email', 'Name', 'Created At'], $users->toArray());

        $this->newLine();
        $this->info('✓ Proses selesai! Silakan login di https://semakinpede.site/admin/login');

        return Command::SUCCESS;
    }
}
