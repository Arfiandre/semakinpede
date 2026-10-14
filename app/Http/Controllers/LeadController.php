<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    public function index(): JsonResponse
    {
        $leads = Lead::orderBy('created_at', 'desc')->get();
        return response()->json($leads);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contactType' => 'nullable|string|in:wa,telegram,email',
            'contact_type' => 'nullable|string',
            'contact' => 'required|string|max:255',
            'level' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'eventId' => 'nullable|string',
            'event_id' => 'nullable|string',
            'eventTitle' => 'nullable|string',
            'event_title' => 'nullable|string',
            'hasAccount' => 'nullable|string',
            'has_account' => 'nullable|string',
            'demoAccountNumber' => 'nullable|string',
            'demo_account_number' => 'nullable|string',
            'demoInvestorPassword' => 'nullable|string',
            'demo_investor_password' => 'nullable|string',
            'screenshotRealAccount' => 'nullable|string',
            'screenshot_real_account' => 'nullable|string',
            'screenshotTransfer' => 'nullable|string',
            'screenshot_transfer' => 'nullable|string',
        ]);

        $id = 'lead-' . Str::uuid();
        $contactType = $request->input('contactType') ?? $request->input('contact_type', 'wa');

        $lead = Lead::create([
            'id' => $id,
            'name' => $validated['name'],
            'contact_type' => $contactType,
            'contact' => $validated['contact'],
            'level' => $request->input('level', 'Pemula'),
            'source' => $request->input('source', 'Website'),
            'submitted_at' => now(),
            'notes' => $request->input('notes'),
            'event_id' => $request->input('eventId') ?? $request->input('event_id'),
            'event_title' => $request->input('eventTitle') ?? $request->input('event_title'),
            'has_account' => $request->input('hasAccount') ?? $request->input('has_account'),
            'demo_account_number' => $request->input('demoAccountNumber') ?? $request->input('demo_account_number'),
            'demo_investor_password' => $request->input('demoInvestorPassword') ?? $request->input('demo_investor_password'),
            'screenshot_real_account' => $request->input('screenshotRealAccount') ?? $request->input('screenshot_real_account'),
            'screenshot_transfer' => $request->input('screenshotTransfer') ?? $request->input('screenshot_transfer'),
        ]);

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'lead_captured',
            'details' => "Lead baru diterima: {$lead->name} ({$lead->contact}) via {$lead->source}",
            'operator' => 'system',
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran / Lead berhasil disimpan ke database.',
            'lead' => $lead,
        ], 201);
    }

    public function destroy(string $id): JsonResponse
    {
        $lead = Lead::find($id);
        if ($lead) {
            $lead->delete();
            return response()->json(['success' => true]);
        }
        return response()->json(['success' => false, 'message' => 'Lead tidak ditemukan'], 404);
    }

    public function clearAll(): JsonResponse
    {
        Lead::truncate();
        return response()->json(['success' => true, 'message' => 'Semua lead berhasil dihapus']);
    }
}
