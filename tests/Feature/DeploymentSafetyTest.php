<?php

namespace Tests\Feature;

use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DeploymentSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_repeated_seeding_preserves_existing_content_and_credentials(): void
    {
        $admin = User::factory()->create(['username' => 'superadmin']);
        $originalPassword = $admin->password;
        $this->seed();
        Event::findOrFail('event-trading-competition-okt-2026')->update(['title' => 'Agenda yang sudah diperbarui']);
        Broker::findOrFail('broker-tpfx')->update(['name' => 'Nama pialang terbaru']);
        SiteSetting::findOrFail(1)->update(['project_title' => 'Nama situs terbaru']);
        EconomicNews::create(['id' => 'news-from-admin', 'title' => 'Berita dari admin', 'country' => 'IDR']);

        $this->seed();

        $this->assertDatabaseHas('events', ['id' => 'event-trading-competition-okt-2026', 'title' => 'Agenda yang sudah diperbarui']);
        $this->assertDatabaseHas('brokers', ['id' => 'broker-tpfx', 'name' => 'Nama pialang terbaru']);
        $this->assertDatabaseHas('site_settings', ['id' => 1, 'project_title' => 'Nama situs terbaru']);
        $this->assertDatabaseHas('economic_news', ['id' => 'news-from-admin', 'title' => 'Berita dari admin']);
        $this->assertDatabaseCount('users', 1);
        $this->assertSame($originalPassword, $admin->fresh()->password);
    }

    public function test_production_seeding_does_not_create_or_modify_application_data(): void
    {
        $admin = User::factory()->create(['username' => 'superadmin']);
        $originalAttributes = $admin->refresh()->getAttributes();
        $this->app->detectEnvironment(fn (): string => 'production');

        $this->artisan('db:seed', ['--force' => true, '--no-interaction' => true])
            ->expectsOutputToContain('Seeder contoh dinonaktifkan di production')
            ->assertExitCode(0);

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($originalAttributes, $admin->fresh()->getAttributes());
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('brokers', 0);
        $this->assertDatabaseCount('site_settings', 0);
        $this->assertDatabaseCount('economic_news', 0);
    }

    public function test_admin_setup_preserves_existing_account_even_with_new_password_options(): void
    {
        $admin = User::factory()->create(['username' => 'superadmin']);
        $originalAttributes = $admin->refresh()->getAttributes();

        $this->artisan('admin:setup', [
            '--password' => 'replacement-password-123',
            '--email' => 'replacement@example.com',
            '--no-interaction' => true,
        ])->expectsOutputToContain('Data dan kata sandi tidak diubah')->assertExitCode(0);

        $this->assertSame($originalAttributes, $admin->fresh()->getAttributes());
        $this->assertDatabaseCount('users', 1);
    }

    public function test_admin_setup_requires_an_explicit_password_in_noninteractive_mode(): void
    {
        $this->artisan('admin:setup', ['--no-interaction' => true])->assertExitCode(1);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_admin_setup_creates_only_the_requested_account_without_printing_the_password(): void
    {
        $this->artisan('admin:setup', [
            '--username' => 'new-admin',
            '--email' => 'new-admin@example.com',
            '--password' => 'unique-secure-password-123',
            '--no-interaction' => true,
        ])->doesntExpectOutputToContain('unique-secure-password-123')->assertExitCode(0);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', ['username' => 'new-admin', 'email' => 'new-admin@example.com']);
        $this->assertTrue(Hash::check('unique-secure-password-123', User::where('username', 'new-admin')->firstOrFail()->password));
    }

    public function test_admin_setup_rejects_short_passwords_without_creating_an_account(): void
    {
        $this->artisan('admin:setup', ['--password' => 'short', '--no-interaction' => true])->assertExitCode(1);

        $this->assertDatabaseCount('users', 0);
    }

    public function test_admin_setup_rejects_an_email_owned_by_an_existing_account(): void
    {
        $admin = User::factory()->create(['username' => 'existing-admin', 'email' => 'admin@semakinpede.com']);
        $originalAttributes = $admin->refresh()->getAttributes();

        $this->artisan('admin:setup', ['--password' => 'secure-password-123', '--no-interaction' => true])->assertExitCode(1);

        $this->assertDatabaseCount('users', 1);
        $this->assertSame($originalAttributes, $admin->fresh()->getAttributes());
    }
}
