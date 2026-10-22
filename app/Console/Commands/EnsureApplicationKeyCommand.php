<?php

namespace App\Console\Commands;

use Dotenv\Dotenv;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Throwable;

#[Signature('app:ensure-key')]
#[Description('Menyiapkan kunci instalasi baru tanpa mengganti APP_KEY yang sudah ada')]
class EnsureApplicationKeyCommand extends Command
{
    public function handle(): int
    {
        if (filled(config('app.key'))) {
            $this->info('APP_KEY sudah tersedia dan tidak diubah.');

            return Command::SUCCESS;
        }

        try {
            $path = $this->laravel->environmentFilePath();
            $contents = File::get($path);
            $environment = Dotenv::parse($contents);

            if (filled($environment['APP_KEY'] ?? null)) {
                $this->info('APP_KEY dalam berkas lingkungan sudah tersedia dan tidak diubah.');

                return Command::SUCCESS;
            }

            if ($this->laravel->isProduction()) {
                $this->error('APP_KEY production kosong. Pulihkan kunci sebelumnya dari backup sebelum melanjutkan.');

                return Command::FAILURE;
            }

            if (preg_match_all('/^[\t ]*(?:export[\t ]+)?APP_KEY[\t ]*=/m', $contents) !== 1 || preg_match('/^APP_KEY=\r?$/m', $contents) !== 1) {
                $this->error('Berkas lingkungan harus memiliki satu baris APP_KEY= kosong untuk instalasi baru.');

                return Command::FAILURE;
            }

            config()->set('app.key', '');
            $status = $this->call('key:generate', ['--no-interaction' => true]);
            $writtenKey = Dotenv::parse(File::get($path))['APP_KEY'] ?? null;

            if ($status !== Command::SUCCESS || blank($writtenKey) || $writtenKey !== config('app.key')) {
                $this->error('Kunci instalasi baru belum berhasil disimpan. Setup dihentikan.');

                return Command::FAILURE;
            }

            return Command::SUCCESS;
        } catch (Throwable) {
            $this->error('APP_KEY tidak dapat diperiksa. Setup dihentikan; periksa berkas lingkungan dan izin aksesnya.');

            return Command::FAILURE;
        }
    }
}
