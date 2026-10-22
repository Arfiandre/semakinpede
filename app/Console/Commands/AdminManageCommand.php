<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

#[Signature('admin:setup {--username=superadmin : Nama pengguna admin baru} {--password= : Kata sandi admin baru; kosongkan untuk prompt tersembunyi} {--email=admin@semakinpede.com : Alamat email admin baru}')]
#[Description('Membuat akun admin baru tanpa mengubah akun atau kredensial yang sudah ada')]
class AdminManageCommand extends Command
{
    public function handle(): int
    {
        if (! Schema::hasTable('users')) {
            $this->error('Tabel users belum ada. Jalankan migrasi secara terpisah setelah backup.');

            return Command::FAILURE;
        }

        $username = (string) $this->option('username');

        if (User::where('username', $username)->exists()) {
            $this->info('Akun admin sudah ada. Data dan kata sandi tidak diubah.');

            return Command::SUCCESS;
        }

        $password = $this->option('password');

        if (! is_string($password) && $this->input->isInteractive()) {
            $password = $this->secret('Kata sandi admin baru (minimal 12 karakter)');
        }

        $credentials = [
            'username' => $username,
            'email' => $this->option('email'),
            'password' => $password,
        ];
        $validator = Validator::make($credentials, [
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:12'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return Command::FAILURE;
        }

        User::create([
            'name' => 'Superadmin Semakin Pede',
            ...$validator->validated(),
        ]);

        $this->info('Akun admin baru berhasil dibuat.');

        return Command::SUCCESS;
    }
}
