<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Process;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class WebServerSecurityPolicyTest extends TestCase
{
    /** @return array<string, array{string, int}> */
    public static function uriPolicy(): array
    {
        return [
            'front controller' => ['/index.php', 0],
            'home' => ['/', 0],
            'admin' => ['/admin/participants', 0],
            'evidence endpoint' => ['/api/leads/lead-one/evidence/real-account', 0],
            'uploaded image' => ['/storage/receipt.png', 0],
            'stylesheets' => ['/build/assets/app.css', 0],
            'root script' => ['/unexpected.php', 1],
            'uploaded script' => ['/storage/unexpected.php', 1],
            'alternate extension' => ['/storage/unexpected.phtml', 1],
            'archive script' => ['/storage/unexpected.phar', 1],
            'numbered extension' => ['/storage/unexpected.php8', 1],
            'mixed case extension' => ['/storage/unexpected.PhP', 1],
            'mixed case front controller' => ['/INDEX.PHP', 1],
            'nested front controller' => ['/storage/index.php', 1],
            'path info' => ['/unexpected.php/extra', 1],
            'front controller path info' => ['/index.php/extra', 1],
        ];
    }

    #[DataProvider('uriPolicy')]
    public function test_nginx_uri_policy_regex_only_permits_the_exact_front_controller(string $uri, int $expectedMatch): void
    {
        $this->assertSame($expectedMatch, preg_match($this->configuredPattern('uri'), $uri));
    }

    /** @return array<string, array{string, int}> */
    public static function contentTypePolicy(): array
    {
        return [
            'JSON form' => ['application/json', 0],
            'JSON charset' => ['application/json; charset=utf-8', 0],
            'ordinary form' => ['application/x-www-form-urlencoded', 0],
            'no body type' => ['', 0],
            'multipart form' => ['multipart/form-data; boundary=example', 1],
            'case variant' => ['Multipart/Form-Data; boundary=example', 1],
            'multipart alternative' => ['multipart/mixed; boundary=example', 1],
        ];
    }

    #[DataProvider('contentTypePolicy')]
    public function test_content_type_policy_regex_preserves_json_forms_and_rejects_multipart(string $contentType, int $expectedMatch): void
    {
        $this->assertSame($expectedMatch, preg_match($this->configuredPattern('http_content_type'), $contentType));
    }

    public function test_php_startup_configuration_disables_upload_progress_and_error_disclosure(): void
    {
        $settings = [
            'session.upload_progress.enabled' => false,
            'display_errors' => false,
            'display_startup_errors' => false,
            'expose_php' => false,
            'allow_url_include' => false,
            'log_errors' => true,
            'zend.exception_ignore_args' => true,
        ];
        $script = '$result = []; foreach ('.var_export(array_keys($settings), true).' as $setting) { $result[$setting] = filter_var(ini_get($setting), FILTER_VALIDATE_BOOLEAN); } echo json_encode($result);';
        $result = Process::timeout(15)->run([PHP_BINARY, '-c', base_path('bootstrap/php-security.ini'), '-r', $script]);

        $this->assertTrue($result->successful(), $result->errorOutput());
        $this->assertSame($settings, json_decode($result->output(), true, flags: JSON_THROW_ON_ERROR));
    }

    private function configuredPattern(string $variable): string
    {
        $configuration = file_get_contents(base_path('bootstrap/nginx-security.conf'));
        $this->assertSame(1, preg_match('/if \(\$'.preg_quote($variable, '/').' ~\*? "([^"]+)"\)/', $configuration, $matches));

        return '~'.$matches[1].'~'.($variable === 'http_content_type' ? 'i' : '');
    }
}
