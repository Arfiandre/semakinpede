<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\Lead;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'initialEvents' => fn () => Event::orderBy('start_date', 'asc')->get(),
            'initialBrokers' => fn () => Broker::orderBy('order', 'asc')->get(),
            'initialNews' => fn () => EconomicNews::limit(100)->get(),
            'initialSettings' => fn () => SiteSetting::first(),
            'initialLeads' => fn () => LeadController::deduplicateCollection(
                LeadController::withEvidenceLinks(Lead::forAdminListing()->orderBy('created_at', 'desc')->get()),
            )->values(),
            'initialStats' => fn () => [
                'leadsCount' => Lead::count(),
                'eventsCount' => Event::count(),
                'brokersCount' => Broker::count(),
                'settingsCount' => SiteSetting::count(),
                'newsCount' => EconomicNews::count(),
                'auditLogsCount' => AuditLog::count(),
                'lastUpdated' => now()->toIso8601String(),
                'storageEngine' => 'Eloquent Database',
            ],
            'auditLogs' => fn () => AuditLog::orderBy('timestamp', 'desc')->limit(50)->get(),
        ]);
    }

    public function participants(): Response
    {
        $rawParticipants = Lead::forAdminListing()->whereNotNull('event_id')
            ->orWhereNotNull('event_title')
            ->orWhereNotNull('demo_account_number')
            ->orWhereNotNull('has_account')
            ->orWhere('source', 'like', '%event%')
            ->orderBy('created_at', 'desc')
            ->get();

        $participants = LeadController::deduplicateCollection(LeadController::withEvidenceLinks($rawParticipants))->values();

        return Inertia::render('Admin/Participants', [
            'initialParticipants' => $participants,
        ]);
    }
}
