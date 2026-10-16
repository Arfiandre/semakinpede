<?php

namespace Tests\Feature;

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
}
