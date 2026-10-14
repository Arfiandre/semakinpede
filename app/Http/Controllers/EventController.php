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
        $validated = $request->validate([
            'id' => 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'status' => 'required|string|in:ongoing,upcoming,past',
            'date' => 'required|string|max:255',
            'time' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:5000',
            'poster_image' => 'nullable|string|max:5000000',
            'posterImage' => 'nullable|string|max:5000000',
            'location' => 'nullable|string|max:255',
            'speaker' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'startDate' => 'nullable|date',
            'end_date' => 'nullable|date',
            'endDate' => 'nullable|date',
            'start_time' => 'nullable|string|max:20',
            'startTime' => 'nullable|string|max:20',
            'end_time' => 'nullable|string|max:20',
            'endTime' => 'nullable|string|max:20',
            'meeting_url' => 'nullable|string|max:500',
            'meetingUrl' => 'nullable|string|max:500',
            'trading_session' => 'nullable|string|max:100',
            'tradingSession' => 'nullable|string|max:100',
            'target_instrument' => 'nullable|string|max:100',
            'targetInstrument' => 'nullable|string|max:100',
            'trading_platform' => 'nullable|string|max:100',
            'tradingPlatform' => 'nullable|string|max:100',
            'workshop_subtype' => 'nullable|string|max:100',
            'workshopSubtype' => 'nullable|string|max:100',
            'prize_pool' => 'nullable|string|max:100',
            'prizePool' => 'nullable|string|max:100',
            'max_drawdown' => 'nullable|string|max:50',
            'maxDrawdown' => 'nullable|string|max:50',
            'registration_deadline' => 'nullable|string|max:50',
            'registrationDeadline' => 'nullable|string|max:50',
            'venue_city' => 'nullable|string|max:100',
            'venueCity' => 'nullable|string|max:100',
            'venue_address' => 'nullable|string|max:500',
            'venueAddress' => 'nullable|string|max:500',
            'seat_quota' => 'nullable|integer|min:0',
            'seatQuota' => 'nullable|integer|min:0',
            'key_takeaways' => 'nullable|array',
            'keyTakeaways' => 'nullable|array',
            'attendees_count' => 'nullable|string|max:100',
            'attendeesCount' => 'nullable|string|max:100',
            'action_text' => 'nullable|string|max:100',
            'actionText' => 'nullable|string|max:100',
            'action_type' => 'nullable|string|max:50',
            'actionType' => 'nullable|string|max:50',
            'recap_note' => 'nullable|string|max:1000',
            'recapNote' => 'nullable|string|max:1000',
            'telegram_group_url' => 'nullable|string|max:500',
            'telegramGroupUrl' => 'nullable|string|max:500',
            'tutorial_account_url' => 'nullable|string|max:500',
            'tutorialAccountUrl' => 'nullable|string|max:500',
        ]);

        $id = $validated['id'] ?? ('event-' . Str::uuid());

        $data = [
            'id' => $id,
            'title' => strip_tags(trim($validated['title'])),
            'category' => strip_tags($validated['category']),
            'status' => $validated['status'],
            'date' => strip_tags(trim($validated['date'])),
            'time' => isset($validated['time']) ? strip_tags(trim($validated['time'])) : null,
            'description' => isset($validated['description']) ? strip_tags(trim($validated['description'])) : null,
            'poster_image' => $validated['poster_image'] ?? $validated['posterImage'] ?? null,
            'location' => isset($validated['location']) ? strip_tags(trim($validated['location'])) : null,
            'speaker' => isset($validated['speaker']) ? strip_tags(trim($validated['speaker'])) : null,
            'start_date' => $validated['start_date'] ?? $validated['startDate'] ?? null,
            'end_date' => $validated['end_date'] ?? $validated['endDate'] ?? null,
            'start_time' => $validated['start_time'] ?? $validated['startTime'] ?? null,
            'end_time' => $validated['end_time'] ?? $validated['endTime'] ?? null,
            'meeting_url' => $validated['meeting_url'] ?? $validated['meetingUrl'] ?? null,
            'trading_session' => $validated['trading_session'] ?? $validated['tradingSession'] ?? null,
            'target_instrument' => $validated['target_instrument'] ?? $validated['targetInstrument'] ?? null,
            'trading_platform' => $validated['trading_platform'] ?? $validated['tradingPlatform'] ?? null,
            'workshop_subtype' => $validated['workshop_subtype'] ?? $validated['workshopSubtype'] ?? null,
            'prize_pool' => $validated['prize_pool'] ?? $validated['prizePool'] ?? null,
            'max_drawdown' => $validated['max_drawdown'] ?? $validated['maxDrawdown'] ?? null,
            'registration_deadline' => $validated['registration_deadline'] ?? $validated['registrationDeadline'] ?? null,
            'venue_city' => $validated['venue_city'] ?? $validated['venueCity'] ?? null,
            'venue_address' => $validated['venue_address'] ?? $validated['venueAddress'] ?? null,
            'seat_quota' => $validated['seat_quota'] ?? $validated['seatQuota'] ?? null,
            'key_takeaways' => $validated['key_takeaways'] ?? $validated['keyTakeaways'] ?? null,
            'attendees_count' => $validated['attendees_count'] ?? $validated['attendeesCount'] ?? null,
            'action_text' => $validated['action_text'] ?? $validated['actionText'] ?? null,
            'action_type' => $validated['action_type'] ?? $validated['actionType'] ?? null,
            'recap_note' => $validated['recap_note'] ?? $validated['recapNote'] ?? null,
            'telegram_group_url' => $validated['telegram_group_url'] ?? $validated['telegramGroupUrl'] ?? null,
            'tutorial_account_url' => $validated['tutorial_account_url'] ?? $validated['tutorialAccountUrl'] ?? null,
        ];

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
