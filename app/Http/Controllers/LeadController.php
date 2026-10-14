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
            'name' => 'required|string|max:100',
            'contactType' => 'nullable|string|in:wa,telegram,email',
            'contact_type' => 'nullable|string|in:wa,telegram,email',
            'contact' => 'required|string|max:100',
            'level' => 'nullable|string|max:50',
            'source' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:2000',
            'eventId' => 'nullable|string|max:100',
            'event_id' => 'nullable|string|max:100',
            'eventTitle' => 'nullable|string|max:255',
            'event_title' => 'nullable|string|max:255',
            'hasAccount' => 'nullable|string|in:sudah,belum',
            'has_account' => 'nullable|string|in:sudah,belum',
            'demoAccountNumber' => 'nullable|string|max:50',
            'demo_account_number' => 'nullable|string|max:50',
            'demoInvestorPassword' => 'nullable|string|max:50',
            'demo_investor_password' => 'nullable|string|max:50',
            'screenshotRealAccount' => 'nullable|string|max:3000000',
            'screenshot_real_account' => 'nullable|string|max:3000000',
            'screenshotTransfer' => 'nullable|string|max:3000000',
            'screenshot_transfer' => 'nullable|string|max:3000000',
        ]);

        $id = 'lead-' . Str::uuid();
        $contactType = $request->input('contactType') ?? $request->input('contact_type', 'wa');

        $lead = Lead::create([
            'id' => $id,
            'name' => strip_tags(trim($validated['name'])),
            'contact_type' => $contactType,
            'contact' => strip_tags(trim($validated['contact'])),
            'level' => strip_tags($request->input('level', 'Pemula')),
            'source' => strip_tags($request->input('source', 'Website')),
            'submitted_at' => now(),
            'notes' => $request->filled('notes') ? strip_tags(trim($request->input('notes'))) : null,
            'event_id' => $request->input('eventId') ?? $request->input('event_id'),
            'event_title' => $request->filled('eventTitle') || $request->filled('event_title') 
                ? strip_tags($request->input('eventTitle') ?? $request->input('event_title')) 
                : null,
            'has_account' => $request->input('hasAccount') ?? $request->input('has_account'),
            'demo_account_number' => $request->filled('demoAccountNumber') || $request->filled('demo_account_number')
                ? strip_tags($request->input('demoAccountNumber') ?? $request->input('demo_account_number'))
                : null,
            'demo_investor_password' => $request->filled('demoInvestorPassword') || $request->filled('demo_investor_password')
                ? strip_tags($request->input('demoInvestorPassword') ?? $request->input('demo_investor_password'))
                : null,
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
