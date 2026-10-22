<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProductionSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_password_does_not_reset_existing_admin_credentials(): void
    {
        $user = User::factory()->create(['username' => 'superadmin', 'password' => 'OwnerCurrentPassword!']);
        $originalPassword = $user->password;

        $this->postJson('/admin/login', ['username' => 'superadmin', 'password' => 'Admin123!'])
            ->assertUnprocessable();

        $this->assertGuest();
        $this->assertSame($originalPassword, $user->fresh()->password);
    }

    public function test_default_login_cannot_create_an_admin_account(): void
    {
        $this->postJson('/admin/login', ['username' => 'Arfiandre', 'password' => 'matematika'])
            ->assertUnprocessable();

        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_public_feeds_work_without_exposing_admin_write_endpoints(): void
    {
        $this->getJson('/api/events')->assertOk()->assertExactJson([]);
        $this->getJson('/api/brokers')->assertOk()->assertExactJson([]);
        $this->getJson('/api/settings')->assertOk();
        $this->getJson('/api/leads')->assertUnauthorized();
        $this->postJson('/api/events', [])->assertUnauthorized();
    }

    public function test_public_submission_does_not_overwrite_someone_elses_registration(): void
    {
        $lead = $this->createLead('owner-lead', ['demo_investor_password' => 'OwnerInvestorPassword']);

        $this->postJson('/api/leads', [
            'id' => $lead->id,
            'name' => 'Different Visitor',
            'contact' => $lead->contact,
            'eventId' => $lead->event_id,
            'demoInvestorPassword' => 'ReplacementPassword',
        ])->assertUnprocessable()->assertJsonValidationErrors('id');

        $this->assertSame('OwnerInvestorPassword', $lead->fresh()->demo_investor_password);
        $this->assertDatabaseCount('leads', 1);
    }

    public function test_same_demo_account_does_not_overwrite_another_contact_or_leak_their_files(): void
    {
        $lead = $this->createLead('owner-lead', ['demo_account_number' => '123456', 'demo_investor_password' => 'OwnerInvestorPassword']);

        $this->postJson('/api/leads', [
            'name' => 'New Visitor',
            'contact' => '081100009999',
            'eventId' => $lead->event_id,
            'demoAccountNumber' => '123456',
        ])->assertCreated()->assertJsonStructure(['lead' => ['id']])
            ->assertJsonMissingPath('lead.demo_investor_password')
            ->assertJsonMissingPath('lead.screenshot_real_account');

        $this->assertSame('OwnerInvestorPassword', $lead->fresh()->demo_investor_password);
        $this->assertDatabaseCount('leads', 2);
    }

    public function test_deleting_one_lead_preserves_other_events_using_the_same_demo_account(): void
    {
        $this->createLead('first-event', ['demo_account_number' => '123456']);
        $otherLead = $this->createLead('other-event', ['event_id' => 'event-b', 'demo_account_number' => '123456']);

        $this->actingAs(User::factory()->create())->deleteJson('/api/leads/first-event')->assertOk();

        $this->assertDatabaseMissing('leads', ['id' => 'first-event']);
        $this->assertModelExists($otherLead);
    }

    public function test_participants_list_fetches_evidence_on_demand_instead_of_embedding_large_images(): void
    {
        $this->createLead('image-lead', ['screenshot_real_account' => 'data:image/png;base64,'.str_repeat('a', 2_000_000)]);

        $response = $this->actingAs(User::factory()->create())->getJson('/api/participants');

        $response->assertOk()->assertJsonFragment(['screenshot_real_account' => '/api/leads/image-lead/evidence/real-account']);
        $this->assertLessThan(5000, strlen($response->getContent()));
    }

    public function test_evidence_is_private_and_can_be_previewed_by_an_admin(): void
    {
        $content = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZ0AAAAASUVORK5CYII=');
        $this->createLead('image-lead', ['screenshot_real_account' => 'data:image/png;base64,'.base64_encode($content)]);

        $this->getJson('/api/leads/image-lead/evidence/real-account')->assertUnauthorized();

        $this->actingAs(User::factory()->create())->get('/api/leads/image-lead/evidence/real-account')
            ->assertOk()->assertHeader('Content-Type', 'image/png')->assertContent($content)
            ->assertHeaderContains('Cache-Control', 'no-store');
        $this->get('/api/leads/image-lead/evidence/invalid')->assertNotFound();
        $this->get('/api/leads/image-lead/evidence/transfer')->assertNotFound();
    }

    public function test_participants_sharing_phone_suffixes_and_demo_numbers_remain_separate(): void
    {
        $this->createLead('contact-a', ['contact' => '081234567890', 'demo_account_number' => '123456']);
        $this->createLead('contact-b', ['contact' => '089234567890', 'demo_account_number' => '123456']);

        $this->actingAs(User::factory()->create())->getJson('/api/participants')
            ->assertOk()->assertJsonCount(2);
    }

    public function test_existing_storage_and_https_evidence_links_are_preserved(): void
    {
        $this->createLead('existing-file', [
            'screenshot_real_account' => '/storage/bukti-terkini.png',
            'screenshot_transfer' => 'https://example.com/receipt.png',
        ]);

        $this->actingAs(User::factory()->create())->getJson('/api/participants')->assertOk()
            ->assertJsonFragment([
                'screenshot_real_account' => '/storage/bukti-terkini.png',
                'screenshot_transfer' => 'https://example.com/receipt.png',
            ]);
        $this->assertDatabaseHas('leads', ['id' => 'existing-file', 'screenshot_real_account' => '/storage/bukti-terkini.png']);
    }

    public function test_events_with_the_same_title_keep_separate_registrations(): void
    {
        $payload = ['name' => 'Returning Participant', 'contact' => '081234567890', 'eventTitle' => 'Monthly Event'];

        $this->postJson('/api/leads', [...$payload, 'eventId' => 'event-a'])->assertCreated();
        $this->postJson('/api/leads', [...$payload, 'eventId' => 'event-b'])->assertCreated();

        $this->assertDatabaseCount('leads', 2);
        $this->assertDatabaseHas('leads', ['contact' => '081234567890', 'event_id' => 'event-a']);
        $this->assertDatabaseHas('leads', ['contact' => '081234567890', 'event_id' => 'event-b']);
    }

    public function test_refreshing_database_statistics_does_not_load_all_participant_rows(): void
    {
        $user = User::factory()->create();
        $this->createLead('stats-lead');
        DB::enableQueryLog();

        $this->actingAs($user)->get('/admin', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(HandleInertiaRequests::class)->version(Request::create('/admin')) ?? '',
            'X-Inertia-Partial-Component' => 'Admin/Dashboard',
            'X-Inertia-Partial-Data' => 'initialStats,auditLogs',
        ])->assertOk()->assertJsonPath('props.initialStats.leadsCount', 1)
            ->assertJsonMissingPath('props.initialLeads');

        $leadQueries = collect(DB::getQueryLog())->filter(fn (array $query): bool => str_contains($query['query'], 'from "leads"'));
        DB::disableQueryLog();
        $this->assertCount(1, $leadQueries);
        $this->assertStringContainsString('count(*)', $leadQueries->first()['query']);
    }

    /** @param array<string, mixed> $attributes */
    private function createLead(string $id, array $attributes = []): Lead
    {
        return Lead::create(array_merge([
            'id' => $id,
            'name' => 'Registration Owner',
            'contact_type' => 'wa',
            'contact' => '081234567890',
            'source' => 'event_registration_step1',
            'event_id' => 'event-a',
        ], $attributes));
    }
}
