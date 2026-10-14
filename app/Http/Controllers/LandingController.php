<?php

namespace App\Http\Controllers;

use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\SiteSetting;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        $events = Event::orderBy('start_date', 'asc')->get();
        $brokers = Broker::orderBy('order', 'asc')->get();
        $settings = SiteSetting::first();
        $news = EconomicNews::limit(20)->get();

        return Inertia::render('Home', [
            'events' => $events,
            'brokers' => $brokers,
            'settings' => $settings,
            'news' => $news,
        ]);
    }
}
