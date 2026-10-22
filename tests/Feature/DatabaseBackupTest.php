<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\Lead;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Exceptions;
use Tests\TestCase;

class DatabaseBackupTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_export_requires_authentication_and_returns_401(): void
    {
        $this->getJson('/api/database/export')->assertUnauthorized();
    }

    public function test_import_requires_authentication_and_returns_401(): void
    {
        $this->postJson('/api/database/import', ['tables' => ['events' => []]])->assertUnauthorized();
    }

    public function test_exports_server_records_as_a_private_streamed_download(): void
    {
        $lead = Lead::create([
            'id' => 'lead-server-only',
            'name' => 'Peserta Server',
            'contact_type' => 'wa',
            'contact' => '081234567890',
            'screenshot_real_account' => 'data:image/png;base64,c2VydmVy',
        ]);
        Event::create(['id' => 'event-server-only', 'title' => 'Agenda Server', 'date' => '22 Oktober 2026']);

        $response = $this->actingAs(User::factory()->create())->get('/api/database/export');

        $response->assertOk()->assertStreamed()->assertDownload()->assertHeader('X-Content-Type-Options', 'nosniff');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $snapshot = json_decode($response->streamedContent(), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame(1, $snapshot['version']);
        $this->assertSame($lead->id, $snapshot['tables']['leads'][0]['id']);
        $this->assertSame('data:image/png;base64,c2VydmVy', $snapshot['tables']['leads'][0]['screenshot_real_account']);
        $this->assertSame('event-server-only', $snapshot['tables']['events'][0]['id']);
        $this->assertSame([], $snapshot['tables']['brokers']);
        $this->assertNull($snapshot['tables']['site_settings']);
        $this->assertArrayNotHasKey('users', $snapshot['tables']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'database_exported']);
    }

    public function test_restore_preserves_existing_records_and_current_settings(): void
    {
        $lead = Lead::create([
            'id' => 'lead-current', 'name' => 'Nama Terkini', 'contact_type' => 'wa', 'contact' => '081234567890',
            'screenshot_real_account' => '/storage/bukti-terkini.png', 'demo_investor_password' => 'KredensialTerkini',
        ]);
        Event::create(['id' => 'event-current', 'title' => 'Agenda Terkini', 'date' => '22 Oktober 2026']);
        SiteSetting::create(['project_title' => 'Judul Terkini']);
        $leadAttributes = $lead->fresh()->getRawOriginal();

        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'version' => 1,
            'tables' => [
                'events' => [
                    ['id' => 'event-current', 'title' => 'Agenda Lama', 'date' => '1 Oktober 2026'],
                    ['id' => 'event-restored', 'title' => 'Agenda Dipulihkan', 'date' => '23 Oktober 2026'],
                ],
                'leads' => [[
                    'id' => 'lead-current', 'name' => 'Nama Lama', 'contact_type' => 'wa', 'contact' => '081111111111',
                    'screenshot_real_account' => null, 'demo_investor_password' => null,
                ]],
                'site_settings' => ['id' => 1, 'project_title' => 'Judul Lama'],
            ],
        ]);

        $response->assertOk()->assertJson(['success' => true, 'restored' => 1, 'skipped' => 3]);
        $this->assertSame($leadAttributes, $lead->fresh()->getRawOriginal());
        $this->assertDatabaseHas('events', ['id' => 'event-current', 'title' => 'Agenda Terkini']);
        $this->assertDatabaseHas('events', ['id' => 'event-restored', 'title' => 'Agenda Dipulihkan']);
        $this->assertDatabaseHas('site_settings', ['project_title' => 'Judul Terkini']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'database_restored']);
    }

    public function test_exported_snapshot_restores_all_supported_tables(): void
    {
        $admin = User::factory()->create();
        Event::create([
            'id' => 'event-backup', 'title' => 'Agenda Cadangan', 'date' => '22 Oktober 2026',
            'start_date' => '2026-10-22', 'key_takeaways' => ['Evaluasi transaksi'],
        ]);
        Broker::create([
            'id' => 'broker-backup', 'name' => 'Mitra', 'short_name' => 'Mitra', 'license_number' => '123',
            'tagline' => 'Mitra Resmi', 'description' => 'Deskripsi', 'action_url' => 'https://example.com',
            'highlights' => ['Pendampingan'],
        ]);
        Lead::create(['id' => 'lead-backup', 'name' => 'Peserta', 'contact_type' => 'wa', 'contact' => '081234567890']);
        EconomicNews::create(['id' => 'news-backup', 'title' => 'Rilis Data', 'country' => 'USD']);
        SiteSetting::create(['project_title' => 'Pengaturan Cadangan', 'social_media' => ['whatsapp' => '081234567890']]);
        $snapshot = json_decode($this->actingAs($admin)->get('/api/database/export')->streamedContent(), true, flags: JSON_THROW_ON_ERROR);
        Event::query()->delete();
        Broker::query()->delete();
        Lead::query()->delete();
        EconomicNews::query()->delete();
        SiteSetting::query()->delete();
        AuditLog::query()->delete();

        $response = $this->postJson('/api/database/import', $snapshot);

        $response->assertOk()->assertJson(['success' => true, 'restored' => 6, 'skipped' => 0]);
        $this->assertDatabaseHas('events', ['id' => 'event-backup', 'title' => 'Agenda Cadangan']);
        $this->assertSame(['Evaluasi transaksi'], Event::findOrFail('event-backup')->key_takeaways);
        $this->assertDatabaseHas('brokers', ['id' => 'broker-backup']);
        $this->assertDatabaseHas('leads', ['id' => 'lead-backup']);
        $this->assertDatabaseHas('economic_news', ['id' => 'news-backup']);
        $this->assertDatabaseHas('site_settings', ['project_title' => 'Pengaturan Cadangan']);
        $this->assertSame(['whatsapp' => '081234567890'], SiteSetting::firstOrFail()->social_media);
        $this->assertDatabaseCount('audit_logs', 2);
    }

    public function test_invalid_later_table_returns_422_without_partial_restore(): void
    {
        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'tables' => [
                'events' => [['id' => 'event-not-written', 'title' => 'Agenda', 'date' => '22 Oktober 2026']],
                'leads' => [['id' => 'lead-invalid', 'name' => 'Tidak Lengkap']],
            ],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['tables.leads.0.contact', 'tables.leads.0.contact_type']);
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('leads', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_unknown_attributes_return_422_without_writes(): void
    {
        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'tables' => [
                'events' => [[
                    'id' => 'event-injected', 'title' => 'Agenda', 'date' => '22 Oktober 2026', 'unknown_column' => 'unsafe',
                ]],
            ],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors('tables.events.0');
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_unsupported_snapshot_version_returns_422_without_writes(): void
    {
        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'version' => 2, 'tables' => ['events' => []],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['version' => 'Versi berkas cadangan tidak didukung.']);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_duplicate_ids_return_422_without_writes(): void
    {
        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'tables' => ['events' => [
                ['id' => 'event-duplicate', 'title' => 'Agenda Pertama', 'date' => '22 Oktober 2026'],
                ['id' => 'event-duplicate', 'title' => 'Agenda Kedua', 'date' => '23 Oktober 2026'],
            ]],
        ]);

        $response->assertUnprocessable()->assertJsonValidationErrors(['tables.events.0.id', 'tables.events.1.id']);
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('audit_logs', 0);
    }

    public function test_failed_database_write_rolls_back_the_entire_restore(): void
    {
        $this->assertSame('sqlite', DB::connection()->getDriverName());
        DB::unprepared("CREATE TRIGGER reject_backup_lead BEFORE INSERT ON leads BEGIN SELECT RAISE(ABORT, 'test write failure'); END");
        Exceptions::fake(QueryException::class);

        $response = $this->actingAs(User::factory()->create())->postJson('/api/database/import', [
            'tables' => [
                'events' => [['id' => 'event-rolled-back', 'title' => 'Agenda', 'date' => '22 Oktober 2026']],
                'leads' => [[
                    'id' => 'lead-rejected', 'name' => 'Peserta', 'contact_type' => 'wa', 'contact' => '081234567890',
                ]],
            ],
        ]);

        $response->assertInternalServerError();
        $this->assertDatabaseCount('events', 0);
        $this->assertDatabaseCount('leads', 0);
        $this->assertDatabaseCount('audit_logs', 0);
        Exceptions::assertReported(QueryException::class);
    }
}
