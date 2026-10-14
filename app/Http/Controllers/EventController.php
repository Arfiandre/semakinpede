<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Event::all());
    }

    public function store(Request $request): JsonResponse
    {
        $id = $request->input('id') ?: 'event-' . Str::uuid();

        $data = $request->except(['_token']);
        $data['id'] = $id;

        $event = Event::updateOrCreate(['id' => $id], $data);

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'event_saved',
            'details' => 'Event disimpan: ' . $event->title,
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'event' => $event,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $event = Event::find($id);
        if ($event) {
            $title = $event->title;
            $event->delete();

            AuditLog::create([
                'id' => 'audit-' . Str::uuid(),
                'action' => 'event_deleted',
                'details' => 'Event dihapus: ' . $title,
                'operator' => auth()->user()?->username ?? 'superadmin',
                'timestamp' => now(),
            ]);

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Event tidak ditemukan'], 404);
    }
}
