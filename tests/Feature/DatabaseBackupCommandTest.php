<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use PDO;
use Tests\TestCase;

class DatabaseBackupCommandTest extends TestCase
{
    public function test_sqlite_snapshot_can_be_opened_and_preserves_the_original_records(): void
    {
        $this->assertSame(':memory:', DB::connection()->getDatabaseName());
        Schema::create('snapshot_records', function (Blueprint $table): void {
            $table->id();
            $table->string('content');
        });
        DB::table('snapshot_records')->insert(['content' => 'current production-style data']);
        $directory = storage_path('framework/testing/backup-'.Str::uuid());
        $path = $directory.'/database.sqlite';

        try {
            $this->artisan('database:backup', ['--path' => $path])->assertExitCode(0);

            $snapshot = new PDO('sqlite:'.$path);
            $this->assertSame('current production-style data', $snapshot->query('SELECT content FROM snapshot_records')->fetchColumn());
            $this->assertSame('ok', $snapshot->query('PRAGMA integrity_check')->fetchColumn());
            $this->assertDatabaseHas('snapshot_records', ['content' => 'current production-style data']);
            $snapshot = null;
        } finally {
            File::delete($path);
            if (is_dir($directory)) {
                rmdir($directory);
            }
        }
    }

    public function test_existing_backups_are_never_overwritten(): void
    {
        $directory = storage_path('framework/testing/backup-'.Str::uuid());
        File::ensureDirectoryExists($directory);
        $path = $directory.'/database.sqlite';
        File::put($path, 'original backup');

        try {
            $this->artisan('database:backup', ['--path' => $path])->assertExitCode(1);

            $this->assertSame('original backup', File::get($path));
        } finally {
            File::delete($path);
            rmdir($directory);
        }
    }

    public function test_backup_rejects_a_publicly_accessible_destination(): void
    {
        $path = public_path('database-backup-test.sqlite');

        $this->artisan('database:backup', ['--path' => $path])->assertExitCode(1);

        $this->assertFileDoesNotExist($path);
    }

    public function test_backup_rejects_the_public_storage_disk_even_outside_the_public_directory(): void
    {
        $path = storage_path('app/public/database-backup-test.sqlite');

        $this->artisan('database:backup', ['--path' => $path])->assertExitCode(1);

        $this->assertFileDoesNotExist($path);
    }

    public function test_backup_rejects_a_configured_public_symlink_target(): void
    {
        $directory = storage_path('framework/testing/public-link-'.Str::uuid());
        File::ensureDirectoryExists($directory);
        config()->set('filesystems.links', [public_path('custom-public-files') => $directory]);
        $path = $directory.'/database.sqlite';

        try {
            $this->artisan('database:backup', ['--path' => $path])->assertExitCode(1);

            $this->assertFileDoesNotExist($path);
        } finally {
            rmdir($directory);
        }
    }

    public function test_mysql_client_failure_stops_backup_without_exposing_credentials(): void
    {
        config()->set('database.connections.backup_mysql', [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'database' => 'backup_test',
            'username' => 'backup_user',
            'password' => 'private-backup-password',
        ]);
        config()->set('database.default', 'backup_mysql');
        Process::preventStrayProcesses();
        Process::fake(['*mysqldump*' => Process::result(errorOutput: 'private-backup-password', exitCode: 1)]);
        $directory = storage_path('framework/testing/backup-'.Str::uuid());
        $path = $directory.'/database.sql';

        try {
            $this->artisan('database:backup', ['--path' => $path])
                ->doesntExpectOutputToContain('private-backup-password')
                ->assertExitCode(1);

            Process::assertRan(fn (PendingProcess $process): bool => $process->command[0] === 'mysqldump'
                && ! str_contains(implode(' ', $process->command), 'private-backup-password')
                && $process->environment['MYSQL_PWD'] === 'private-backup-password');
            $this->assertFileDoesNotExist($path);
        } finally {
            if (is_dir($directory)) {
                rmdir($directory);
            }
        }
    }

    public function test_mysql_backup_requires_a_nonempty_snapshot_file_before_reporting_success(): void
    {
        config()->set('database.connections.backup_mysql', [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'database' => 'backup_test',
            'username' => 'backup_user',
            'password' => 'private-backup-password',
        ]);
        config()->set('database.default', 'backup_mysql');
        Process::preventStrayProcesses();
        Process::fake(['*mysqldump*' => Process::result(exitCode: 0)]);
        $directory = storage_path('framework/testing/backup-'.Str::uuid());
        $path = $directory.'/database.sql';

        try {
            $this->artisan('database:backup', ['--path' => $path])->assertExitCode(1);

            Process::assertRan(fn (PendingProcess $process): bool => in_array('--result-file='.realpath($directory).DIRECTORY_SEPARATOR.'database.sql', $process->command, true));
            $this->assertFileDoesNotExist($path);
        } finally {
            if (is_dir($directory)) {
                rmdir($directory);
            }
        }
    }

    public function test_mysql_backup_succeeds_after_the_client_writes_a_snapshot(): void
    {
        config()->set('database.connections.backup_mysql', [
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'database' => 'backup_test',
            'username' => 'backup_user',
            'password' => 'private-backup-password',
        ]);
        config()->set('database.default', 'backup_mysql');
        Process::preventStrayProcesses();
        $directory = storage_path('framework/testing/backup-'.Str::uuid());
        $path = $directory.'/database.sql';
        Process::fake(['*mysqldump*' => function () use ($path) {
            File::put($path, 'CREATE TABLE saved_records (id INT);');

            return Process::result(exitCode: 0);
        }]);

        try {
            $this->artisan('database:backup', ['--path' => $path])->assertExitCode(0);

            Process::assertRan(fn (PendingProcess $process): bool => in_array('--single-transaction', $process->command, true));
            $this->assertSame('CREATE TABLE saved_records (id INT);', File::get($path));
        } finally {
            File::delete($path);
            if (is_dir($directory)) {
                rmdir($directory);
            }
        }
    }
}
