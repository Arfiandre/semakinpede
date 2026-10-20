<?php

namespace Tests\Feature;

use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompetitionParticipantTest extends TestCase
{
    use RefreshDatabase;

    public function test_trading_competition_category_and_event(): void
    {
        $this->seed();

        $event = Event::first();
        $this->assertNotNull($event);
        $this->assertEquals('Trading Competition', $event->category);
        $this->assertEquals(
            'https://drive.google.com/file/d/1kBVRqc8q6XcvHSdqVweg_Fc64Z_u79FV/view?usp=sharing',
            $event->tutorial_account_url
        );
        $this->assertNull($event->attendees_count);
    }

    public function test_admin_participants_page_requires_auth(): void
    {
        $response = $this->get('/admin/participants');
        $response->assertRedirect('/admin/login');
    }

    public function test_admin_can_access_participants_page(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/admin/participants');
        $response->assertStatus(200);
    }

    public function test_admin_can_fetch_participants_api(): void
    {
        $user = User::factory()->create();

        Lead::create([
            'id' => 'test-part-1',
            'name' => 'Peserta Uji Coba',
            'contact_type' => 'wa',
            'contact' => '08176792110',
            'level' => 'Peserta Event',
            'source' => 'event_registration_step1',
            'event_id' => 'event-trading-competition-okt-2026',
            'event_title' => 'Trading Semakin Pede Competition',
            'has_account' => 'sudah',
            'demo_account_number' => '1002003',
            'demo_investor_password' => 'PassDemo123',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($user)->getJson('/api/participants');
        $response->assertStatus(200);
        $response->assertJsonFragment([
            'id' => 'test-part-1',
            'name' => 'Peserta Uji Coba',
            'demo_account_number' => '1002003',
        ]);
    }

    public function test_public_event_form_lead_store(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'contactType' => 'wa',
            'contact' => '08176792110',
            'level' => 'Peserta Event',
            'source' => 'event_trading_account_submitted',
            'eventId' => 'event-trading-competition-okt-2026',
            'eventTitle' => 'Trading Semakin Pede Competition',
            'hasAccount' => 'sudah',
            'demoAccountNumber' => '998877',
            'demoInvestorPassword' => 'Investor99',
            'screenshotRealAccount' => 'akun-riil.png',
            'screenshotTransfer' => 'bukti-transfer.png',
        ];

        $response = $this->postJson('/api/leads', $payload);
        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('leads', [
            'name' => 'Budi Santoso',
            'demo_account_number' => '998877',
            'demo_investor_password' => 'Investor99',
        ]);
    }

    public function test_arfiandre_can_login_with_matematika_password(): void
    {
        $this->seed();

        $response = $this->postJson('/admin/login', [
            'username' => 'Arfiandre',
            'password' => 'matematika',
            'remember' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $this->assertAuthenticated();
    }

    public function test_admin_can_delete_lead(): void
    {
        $user = User::factory()->create();

        $lead = Lead::create([
            'id' => 'lead-to-delete-123',
            'name' => 'Peserta Dihapus',
            'contact_type' => 'wa',
            'contact' => '08123456789',
            'level' => 'Pemula',
            'source' => 'Website',
            'submitted_at' => now(),
        ]);

        $this->assertDatabaseHas('leads', ['id' => 'lead-to-delete-123']);

        $response = $this->actingAs($user)->deleteJson('/api/leads/lead-to-delete-123');
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseMissing('leads', ['id' => 'lead-to-delete-123']);
    }

    public function test_submitting_step1_then_step2_updates_record_without_duplication(): void
    {
        $step1Payload = [
            'id' => 'lead-user-step-test',
            'name' => 'Peserta Unik',
            'contactType' => 'wa',
            'contact' => '081299998888',
            'level' => 'Peserta Event',
            'source' => 'event_registration_step1',
            'eventId' => 'event-trading-competition-okt-2026',
            'eventTitle' => 'Trading Semakin Pede Competition',
            'hasAccount' => 'sudah',
        ];

        // Step 1 Submission
        $res1 = $this->postJson('/api/leads', $step1Payload);
        $res1->assertStatus(201);
        $this->assertDatabaseCount('leads', 1);

        $step2Payload = [
            'id' => 'lead-user-step-test',
            'name' => 'Peserta Unik',
            'contactType' => 'wa',
            'contact' => '081299998888',
            'level' => 'Verifikasi Akun Event Selesai',
            'source' => 'event_trading_account_submitted',
            'eventId' => 'event-trading-competition-okt-2026',
            'eventTitle' => 'Trading Semakin Pede Competition',
            'hasAccount' => 'sudah',
            'demoAccountNumber' => '654321',
            'demoInvestorPassword' => 'SecretInvestor1',
            'screenshotRealAccount' => 'real.jpg',
            'screenshotTransfer' => 'tf.jpg',
        ];

        // Step 2 Submission (same ID and/or same contact+event)
        $res2 = $this->postJson('/api/leads', $step2Payload);
        $res2->assertStatus(200);
        $res2->assertJson([
            'success' => true,
        ]);

        // Verify NO duplicate record was created
        $this->assertDatabaseCount('leads', 1);
        $this->assertDatabaseHas('leads', [
            'id' => 'lead-user-step-test',
            'name' => 'Peserta Unik',
            'demo_account_number' => '654321',
            'source' => 'event_trading_account_submitted',
        ]);
    }

    public function test_submitting_duplicate_contact_without_client_id_still_updates_existing_lead(): void
    {
        $lead1 = [
            'name' => 'Andi Wijaya',
            'contact' => '085711223344',
            'eventId' => 'event-trading-competition-okt-2026',
            'source' => 'event_registration_step1',
        ];

        $res1 = $this->postJson('/api/leads', $lead1);
        $res1->assertStatus(201);
        $this->assertDatabaseCount('leads', 1);

        // Second submission without 'id', but same phone and event
        $lead2 = [
            'name' => 'Andi Wijaya',
            'contact' => '+6285711223344',
            'eventId' => 'event-trading-competition-okt-2026',
            'demoAccountNumber' => '888777',
            'demoInvestorPassword' => 'Pass888',
        ];

        $res2 = $this->postJson('/api/leads', $lead2);
        $res2->assertStatus(200);

        // Verify still only 1 record exists in database
        $this->assertDatabaseCount('leads', 1);
        $this->assertDatabaseHas('leads', [
            'demo_account_number' => '888777',
        ]);
    }

    public function test_participants_api_returns_deduplicated_list(): void
    {
        $user = User::factory()->create();

        // Seed 2 duplicate records for the same participant with different IDs
        Lead::create([
            'id' => 'lead-dup-1',
            'name' => 'Peserta Ganda',
            'contact_type' => 'wa',
            'contact' => '081333444555',
            'level' => 'Peserta Event',
            'source' => 'event_registration_step1',
            'event_id' => 'event-1',
            'submitted_at' => now()->subMinute(),
        ]);

        Lead::create([
            'id' => 'lead-dup-2',
            'name' => 'Peserta Ganda',
            'contact_type' => 'wa',
            'contact' => '081333444555',
            'level' => 'Verifikasi Akun Event Selesai',
            'source' => 'event_trading_account_submitted',
            'event_id' => 'event-1',
            'demo_account_number' => '112233',
            'demo_investor_password' => 'PassDemo',
            'submitted_at' => now(),
        ]);

        $this->assertDatabaseCount('leads', 2);

        $response = $this->actingAs($user)->getJson('/api/participants');
        $response->assertStatus(200);

        $data = $response->json();
        // Collection should be deduplicated to 1 item
        $this->assertCount(1, $data);
        $this->assertEquals('112233', $data[0]['demo_account_number']);
    }

    public function test_economic_news_has_current_dates_with_bottom_limit_today(): void
    {
        $this->seed();

        $news = EconomicNews::all();
        $this->assertNotEmpty($news);

        $tzWib = new \DateTimeZone('Asia/Jakarta');
        $todayStart = new \DateTime('today', $tzWib);

        foreach ($news as $item) {
            $this->assertContains($item->impact, ['High', 'Medium']);
            $this->assertNotNull($item->date_raw);

            $eventDate = new \DateTime($item->date_raw);
            $eventDate->setTimezone($tzWib);

            // Batas terbawah adalah per hari ini (>= todayStart)
            $this->assertGreaterThanOrEqual(
                $todayStart->getTimestamp(),
                $eventDate->getTimestamp(),
                "Event {$item->title} pada {$item->date_raw} lebih lampau dari hari ini."
            );
        }
    }
}
