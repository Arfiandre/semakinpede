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
        $events = Event::orderBy('start_date', 'asc')->get();
        $brokers = Broker::orderBy('order', 'asc')->get();
        $news = EconomicNews::limit(100)->get();
        $settings = SiteSetting::first();
        $leads = Lead::orderBy('created_at', 'desc')->get();
        $auditLogs = AuditLog::orderBy('timestamp', 'desc')->limit(50)->get();

        $stats = [
            'leadsCount' => $leads->count(),
            'eventsCount' => $events->count(),
            'brokersCount' => $brokers->count(),
            'settingsCount' => $settings ? 1 : 0,
            'newsCount' => $news->count(),
            'auditLogsCount' => $auditLogs->count(),
            'lastUpdated' => now()->toIso8601String(),
            'storageEngine' => 'MySQL / Eloquent Database',
        ];

        return Inertia::render('Admin/Dashboard', [
            'initialEvents' => $events,
            'initialBrokers' => $brokers,
            'initialNews' => $news,
            'initialSettings' => $settings,
            'initialLeads' => $leads,
            'initialStats' => $stats,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function participants(): Response
    {
        $participants = Lead::whereNotNull('event_id')
            ->orWhereNotNull('event_title')
            ->orWhereNotNull('demo_account_number')
            ->orWhereNotNull('has_account')
            ->orWhere('source', 'like', '%event%')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Participants', [
            'initialParticipants' => $participants,
        ]);
    }
}
