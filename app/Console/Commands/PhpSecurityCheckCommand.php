<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Throwable;

#[Signature('app:php-security-check')]
#[Description('Memeriksa batas patch keamanan PHP CLI sebelum deployment')]
class PhpSecurityCheckCommand extends Command
{
    private const MINIMUM_VERSIONS = [
        '8.3' => '8.3.36',
        '8.4' => '8.4.27',
        '8.5' => '8.5.12',
    ];

    public function handle(): int
    {
        $version = $this->runtimeVersion();
        $this->line('PHP CLI yang diperiksa: '.$version);
        $this->line('Pemeriksaan ini hanya untuk CLI dan bukan jaminan bebas celah keamanan.');
        $this->line('PHP-FPM dan worker harus diperbarui serta dimulai ulang secara terpisah.');

        if (preg_match('/\A(?<branch>8\.[345])\.\d+\z/', $version, $matches) !== 1) {
            $this->error('Versi PHP CLI belum didukung atau bukan rilis stabil. Deployment dihentikan sebelum perubahan aplikasi.');

            return Command::FAILURE;
        }

        if (version_compare($version, self::MINIMUM_VERSIONS[$matches['branch']], '>=')) {
            $this->info('PHP CLI memenuhi batas patch keamanan yang diperiksa.');

            return Command::SUCCESS;
        }

        if ($version === '8.3.6' && $this->hasVerifiedUbuntuBackport()) {
            $this->info('PHP CLI memakai paket Ubuntu 24.04 dengan backport patch keamanan yang terverifikasi.');

            return Command::SUCCESS;
        }

        $this->error('PHP CLI belum memiliki patch yang diperlukan. Gunakan PHP 8.3.36+, 8.4.27+, atau 8.5.12+ pada cabang terkait.');
        $this->error('Deployment dihentikan sebelum maintenance, pembaruan kode, atau migrasi.');

        return Command::FAILURE;
    }

    protected function runtimeVersion(): string
    {
        return PHP_VERSION;
    }

    protected function runtimeBinary(): string
    {
        return realpath(PHP_BINARY) ?: PHP_BINARY;
    }

    /**
     * @return array<string, string>
     */
    protected function operatingSystem(): array
    {
        if (! is_readable('/etc/os-release')) {
            return [];
        }

        $release = @parse_ini_file('/etc/os-release', false, INI_SCANNER_RAW);

        return $release === false ? [] : $release;
    }

    private function hasVerifiedUbuntuBackport(): bool
    {
        $system = $this->operatingSystem();

        if (($system['ID'] ?? null) !== 'ubuntu' || ($system['VERSION_ID'] ?? null) !== '24.04') {
            return false;
        }

        try {
            $binary = $this->runtimeBinary();
            $owner = Process::timeout(5)->quietly()->run(['dpkg-query', '--search', '--', $binary]);

            if ($owner->failed() || preg_match('/\Aphp8\.3-cli(?::[a-z0-9-]+)?: '.preg_quote($binary, '/').'\s*\z/', trim($owner->output())) !== 1) {
                return false;
            }

            $package = Process::timeout(5)->quietly()->run([
                'dpkg-query', '--show', '--showformat=${db:Status-Status}\n${Version}', 'php8.3-cli',
            ]);
            $metadata = explode("\n", trim($package->output()));
            $packageVersion = $metadata[1] ?? '';

            if ($package->failed() || count($metadata) !== 2 || $metadata[0] !== 'installed' || preg_match('/\A8\.3\.6-0ubuntu0\.24\.04\.\d+\z/', $packageVersion) !== 1) {
                return false;
            }

            return Process::timeout(5)->quietly()->run([
                'dpkg', '--compare-versions', $packageVersion, 'ge', '8.3.6-0ubuntu0.24.04.13',
            ])->successful();
        } catch (Throwable) {
            return false;
        }
    }
}
