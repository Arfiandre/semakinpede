<?php

namespace Tests\Feature;

use App\Console\Commands\PhpSecurityCheckCommand;
use Illuminate\Process\PendingProcess;
use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PhpSecurityCheckTest extends TestCase
{
    /**
     * @return array<string, array{string, int}>
     */
    public static function upstreamVersions(): array
    {
        return [
            'affected 8.3' => ['8.3.35', 1],
            'patched 8.3' => ['8.3.36', 0],
            'later 8.3 patch' => ['8.3.37', 0],
            'affected 8.4' => ['8.4.26', 1],
            'patched 8.4' => ['8.4.27', 0],
            'affected 8.5' => ['8.5.11', 1],
            'patched 8.5' => ['8.5.12', 0],
            'unsupported 8.2' => ['8.2.99', 1],
            'unsupported 8.1' => ['8.1.99', 1],
            'unknown branch' => ['8.6.0', 1],
            'release candidate' => ['8.3.36RC1', 1],
            'development build' => ['8.5.12-dev', 1],
        ];
    }

    #[DataProvider('upstreamVersions')]
    public function test_deployment_requires_a_supported_stable_patched_php_runtime(string $version, int $expectedExitCode): void
    {
        Process::preventStrayProcesses();
        Process::fake();
        $this->useRuntime($version);

        $this->artisan('app:php-security-check', ['--no-interaction' => true])
            ->expectsOutputToContain('hanya untuk CLI')
            ->expectsOutputToContain('PHP-FPM dan worker harus diperbarui')
            ->assertExitCode($expectedExitCode);

        Process::assertNothingRan();
    }

    /**
     * @return array<string, array{string, string, string, string, string, int, int}>
     */
    public static function ubuntuBackports(): array
    {
        return [
            'official patched revision' => ['ubuntu', '24.04', '8.3.6', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.13', 0, 0],
            'later official revision' => ['ubuntu', '24.04', '8.3.6', 'php8.3-cli:amd64', 'installed\n8.3.6-0ubuntu0.24.04.14', 0, 0],
            'affected official revision' => ['ubuntu', '24.04', '8.3.6', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.12', 1, 1],
            'PPA version cannot impersonate backport' => ['ubuntu', '24.04', '8.3.6', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.13+ppa1', 0, 1],
            'uninstalled package' => ['ubuntu', '24.04', '8.3.6', 'php8.3-cli', 'config-files\n8.3.6-0ubuntu0.24.04.13', 0, 1],
            'different binary owner' => ['ubuntu', '24.04', '8.3.6', 'custom-php', 'installed\n8.3.6-0ubuntu0.24.04.13', 0, 1],
            'different distro' => ['debian', '24.04', '8.3.6', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.13', 0, 1],
            'different Ubuntu release' => ['ubuntu', '22.04', '8.3.6', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.13', 0, 1],
            'different runtime cannot borrow package patch' => ['ubuntu', '24.04', '8.3.5', 'php8.3-cli', 'installed\n8.3.6-0ubuntu0.24.04.13', 0, 1],
        ];
    }

    #[DataProvider('ubuntuBackports')]
    public function test_only_a_verified_ubuntu_backport_for_the_running_binary_is_accepted(
        string $distribution,
        string $release,
        string $runtimeVersion,
        string $owner,
        string $packageMetadata,
        int $comparisonExitCode,
        int $expectedExitCode,
    ): void {
        Process::preventStrayProcesses();
        Process::fake([
            '*dpkg-query*--search*' => Process::result(output: $owner.': /usr/bin/php8.3'),
            '*dpkg-query*--show*' => Process::result(output: str_replace('\\n', "\n", $packageMetadata)),
            '*dpkg*--compare-versions*' => Process::result(exitCode: $comparisonExitCode),
        ]);
        $this->useRuntime($runtimeVersion, ['ID' => $distribution, 'VERSION_ID' => $release]);

        $this->artisan('app:php-security-check', ['--no-interaction' => true])->assertExitCode($expectedExitCode);

        if ($expectedExitCode === 0) {
            Process::assertRan(fn (PendingProcess $process): bool => $process->command === ['dpkg-query', '--search', '--', '/usr/bin/php8.3']);
        } else {
            Process::assertNotRan(fn (PendingProcess $process): bool => $process->command[0] !== 'dpkg-query' && $process->command[0] !== 'dpkg');
        }
    }

    public function test_missing_package_tools_stop_the_backport_check_without_changing_the_system(): void
    {
        Process::preventStrayProcesses();
        Process::fake(['*dpkg-query*' => Process::result(exitCode: 127)]);
        $this->useRuntime('8.3.6', ['ID' => 'ubuntu', 'VERSION_ID' => '24.04']);

        $this->artisan('app:php-security-check', ['--no-interaction' => true])
            ->expectsOutputToContain('Deployment dihentikan sebelum maintenance')
            ->assertExitCode(1);

        Process::assertRanTimes(['dpkg-query', '--search', '--', '/usr/bin/php8.3'], 1);
    }

    /**
     * @param  array<string, string>  $operatingSystem
     */
    private function useRuntime(string $version, array $operatingSystem = []): void
    {
        $command = new class($version, $operatingSystem) extends PhpSecurityCheckCommand
        {
            protected $signature = 'app:php-security-check';

            /**
             * @param  array<string, string>  $system
             */
            public function __construct(private string $version, private array $system)
            {
                parent::__construct();
            }

            protected function runtimeVersion(): string
            {
                return $this->version;
            }

            protected function runtimeBinary(): string
            {
                return '/usr/bin/php8.3';
            }

            protected function operatingSystem(): array
            {
                return $this->system;
            }
        };

        $this->app->instance(PhpSecurityCheckCommand::class, $command);
    }
}
