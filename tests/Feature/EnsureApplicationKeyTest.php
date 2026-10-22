<?php

namespace Tests\Feature;

use Dotenv\Dotenv;
use Illuminate\Encryption\Encrypter;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class EnsureApplicationKeyTest extends TestCase
{
    public function test_existing_configured_key_is_never_rotated(): void
    {
        $key = 'base64:'.base64_encode(str_repeat('k', 32));
        config()->set('app.key', $key);
        $directory = $this->useTemporaryEnvironment("APP_KEY=\nAPP_NAME=Existing\n");

        try {
            $this->artisan('app:ensure-key', ['--no-interaction' => true])
                ->doesntExpectOutputToContain($key)
                ->assertExitCode(0);

            $this->assertSame($key, config('app.key'));
            $this->assertSame("APP_KEY=\nAPP_NAME=Existing\n", File::get($directory.'/.env'));
        } finally {
            $this->removeTemporaryEnvironment($directory);
        }
    }

    public function test_existing_environment_key_is_preserved_even_if_config_is_empty(): void
    {
        config()->set('app.key', '');
        $key = 'base64:'.base64_encode(str_repeat('e', 32));
        $contents = "APP_KEY=\"{$key}\"\nAPP_NAME=Existing\n";
        $directory = $this->useTemporaryEnvironment($contents);

        try {
            $this->artisan('app:ensure-key', ['--no-interaction' => true])
                ->doesntExpectOutputToContain($key)
                ->assertExitCode(0);

            $this->assertSame($contents, File::get($directory.'/.env'));
        } finally {
            $this->removeTemporaryEnvironment($directory);
        }
    }

    public function test_fresh_setup_generates_one_key_and_repeated_setup_preserves_it(): void
    {
        config()->set('app.key', '');
        $directory = $this->useTemporaryEnvironment("APP_NAME=Fresh\nAPP_KEY=\nDB_DATABASE=existing-database\n");

        try {
            $this->artisan('app:ensure-key', ['--no-interaction' => true])->assertExitCode(0);

            $contents = File::get($directory.'/.env');
            $key = Dotenv::parse($contents)['APP_KEY'];
            $this->assertTrue(Encrypter::supported(base64_decode(substr($key, 7), true), 'AES-256-CBC'));
            $this->assertSame($key, config('app.key'));
            $this->assertStringContainsString("APP_NAME=Fresh\n", $contents);
            $this->assertStringContainsString("DB_DATABASE=existing-database\n", $contents);

            $this->artisan('app:ensure-key', ['--no-interaction' => true])->assertExitCode(0);

            $this->assertSame($contents, File::get($directory.'/.env'));
        } finally {
            $this->removeTemporaryEnvironment($directory);
        }
    }

    public function test_empty_production_key_stops_setup_without_generating_a_replacement(): void
    {
        config()->set('app.key', '');
        $this->app->detectEnvironment(fn (): string => 'production');
        $directory = $this->useTemporaryEnvironment("APP_KEY=\n");

        try {
            $this->artisan('app:ensure-key', ['--no-interaction' => true])
                ->expectsOutputToContain('Pulihkan kunci sebelumnya dari backup')
                ->assertExitCode(1);

            $this->assertSame("APP_KEY=\n", File::get($directory.'/.env'));
            $this->assertSame('', config('app.key'));
        } finally {
            $this->removeTemporaryEnvironment($directory);
        }
    }

    /**
     * @return array<string, array{string}>
     */
    public static function ambiguousEnvironmentFiles(): array
    {
        return [
            'missing placeholder' => ["APP_NAME=Existing\n"],
            'quoted blank placeholder' => ["APP_KEY=\"\"\n"],
            'duplicate placeholder masks existing key' => ["APP_KEY=existing-key\nAPP_KEY=\n"],
            'invalid environment syntax' => ["APP_KEY=\nINVALID KEY=value\n"],
        ];
    }

    #[DataProvider('ambiguousEnvironmentFiles')]
    public function test_ambiguous_environment_file_stops_setup_without_changes(string $contents): void
    {
        config()->set('app.key', '');
        $directory = $this->useTemporaryEnvironment($contents);

        try {
            $this->artisan('app:ensure-key', ['--no-interaction' => true])->assertExitCode(1);

            $this->assertSame($contents, File::get($directory.'/.env'));
            $this->assertSame('', config('app.key'));
        } finally {
            $this->removeTemporaryEnvironment($directory);
        }
    }

    private function useTemporaryEnvironment(string $contents): string
    {
        $directory = storage_path('framework/testing/app-key-'.Str::uuid());
        File::ensureDirectoryExists($directory);
        File::put($directory.'/.env', $contents);
        $this->app->useEnvironmentPath($directory)->loadEnvironmentFrom('.env');

        return $directory;
    }

    private function removeTemporaryEnvironment(string $directory): void
    {
        File::delete($directory.'/.env');
        rmdir($directory);
    }
}
