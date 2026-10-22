<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function index(): Response
    {
        $events = Event::orderBy('start_date', 'asc')->get();

        return Inertia::render('Home', [
            'events' => $events,
        ]);
    }
}
