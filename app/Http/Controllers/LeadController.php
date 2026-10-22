<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class LeadController extends Controller
{
    /**
     * Deduplicate a collection of leads so that double submissions
     * or step1/step2 fragments are cleanly consolidated.
     *
     * @param  Collection<int, Lead>  $leads
     * @return Collection<int, Lead>
     */
    public static function deduplicateCollection(Collection $leads): Collection
    {
        $groups = [];

        foreach ($leads as $lead) {
            $key = null;
            $contact = (string) ($lead->contact ?? '');
            $digits = preg_replace('/[^0-9]/', '', $contact);
            $suffix = strlen($digits) >= 8 ? substr($digits, -9) : $contact;

            // Prioritize Event + Contact match (so Step 1 and Step 2 of same event always match)
            if (! empty($lead->event_id) && ! empty($suffix)) {
                $key = "event:{$lead->event_id}:{$suffix}";
            } elseif (! empty($lead->event_title) && ! empty($suffix)) {
                $key = "event_title:{$lead->event_title}:{$suffix}";
            } elseif (! empty($lead->demo_account_number) && strlen((string) $lead->demo_account_number) >= 4) {
                $key = 'demo:'.trim((string) $lead->demo_account_number);
            } elseif (! empty($suffix) && ! empty($lead->name) && $lead->name !== '-') {
                $key = "lead:{$suffix}:".strtolower(trim((string) $lead->name));
            } else {
                $key = "id:{$lead->id}";
            }

            if (! isset($groups[$key])) {
                $groups[$key] = $lead;
            } else {
                $current = $groups[$key];
                $preferNew = false;

                // Prefer the record that has demo account number or screenshot
                if (empty($current->demo_account_number) && ! empty($lead->demo_account_number)) {
                    $preferNew = true;
                } elseif (empty($current->screenshot_real_account) && ! empty($lead->screenshot_real_account)) {
                    $preferNew = true;
                }

                if ($preferNew) {
                    if (empty($lead->notes) && ! empty($current->notes)) {
                        $lead->notes = $current->notes;
                    }
                    $groups[$key] = $lead;
                } else {
                    if (empty($current->demo_account_number) && ! empty($lead->demo_account_number)) {
                        $current->demo_account_number = $lead->demo_account_number;
                    }
                    if (empty($current->demo_investor_password) && ! empty($lead->demo_investor_password)) {
                        $current->demo_investor_password = $lead->demo_investor_password;
                    }
                    if (empty($current->screenshot_real_account) && ! empty($lead->screenshot_real_account)) {
                        $current->screenshot_real_account = $lead->screenshot_real_account;
                    }
                    if (empty($current->screenshot_transfer) && ! empty($lead->screenshot_transfer)) {
                        $current->screenshot_transfer = $lead->screenshot_transfer;
                    }
                }
            }
        }

        // Pass 2: Deduplicate any records sharing the same demo account number
        $final = [];
        $seenDemoAccounts = [];

        foreach ($groups as $lead) {
            $demoAcc = ! empty($lead->demo_account_number) && strlen((string) $lead->demo_account_number) >= 4
                ? trim((string) $lead->demo_account_number)
                : null;

            if ($demoAcc) {
                if (isset($seenDemoAccounts[$demoAcc])) {
                    continue; // Skip duplicate demo account
                }
                $seenDemoAccounts[$demoAcc] = true;
            }

            $final[] = $lead;
        }

        return collect($final);
    }

    public function index(): JsonResponse
    {
        $rawLeads = Lead::orderBy('created_at', 'desc')->get();
        $leads = self::deduplicateCollection($rawLeads);

        return response()->json($leads->values());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|string|max:100',
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
            'screenshotRealAccount' => 'nullable|string|max:7000000',
            'screenshot_real_account' => 'nullable|string|max:7000000',
            'screenshotTransfer' => 'nullable|string|max:7000000',
            'screenshot_transfer' => 'nullable|string|max:7000000',
        ]);

        $providedId = $request->filled('id') ? strip_tags(trim($request->input('id'))) : null;
        $name = strip_tags(trim($validated['name']));
        $contactType = $request->input('contactType') ?? $request->input('contact_type', 'wa');
        $contact = strip_tags(trim($validated['contact']));
        $eventId = $request->input('eventId') ?? $request->input('event_id');
        $eventTitle = $request->filled('eventTitle') || $request->filled('event_title')
            ? strip_tags($request->input('eventTitle') ?? $request->input('event_title'))
            : null;
        $hasAccount = $request->input('hasAccount') ?? $request->input('has_account');
        $demoAcc = $request->filled('demoAccountNumber') || $request->filled('demo_account_number')
            ? strip_tags(trim($request->input('demoAccountNumber') ?? $request->input('demo_account_number')))
            : null;
        $demoPass = $request->filled('demoInvestorPassword') || $request->filled('demo_investor_password')
            ? strip_tags(trim($request->input('demoInvestorPassword') ?? $request->input('demo_investor_password')))
            : null;
        $screenshotReal = $request->input('screenshotRealAccount') ?? $request->input('screenshot_real_account');
        $screenshotTransfer = $request->input('screenshotTransfer') ?? $request->input('screenshot_transfer');
        $level = $request->filled('level') ? strip_tags(trim($request->input('level'))) : 'Pemula';
        $source = $request->filled('source') ? strip_tags(trim($request->input('source'))) : 'Website';
        $notes = $request->filled('notes') ? strip_tags(trim($request->input('notes'))) : null;

        // Check for existing lead to prevent duplicate records
        $existingLead = null;

        // 1. Check by explicit ID if provided
        if (! empty($providedId)) {
            $existingLead = Lead::find($providedId);
            if (! $existingLead) {
                $altId = str_starts_with($providedId, 'lead-') ? substr($providedId, 5) : 'lead-'.$providedId;
                $existingLead = Lead::find($altId);
            }
        }

        // 2. Check by demo account number (if submitted and >= 4 digits)
        if (! $existingLead && ! empty($demoAcc) && strlen($demoAcc) >= 4) {
            $existingLead = Lead::where('demo_account_number', $demoAcc)->first();
        }

        // 3. Check by Event + Contact (with phone normalization)
        $cleanDigits = preg_replace('/[^0-9]/', '', $contact);
        if (! $existingLead && ! empty($eventId)) {
            $query = Lead::where(function ($q) use ($eventId, $eventTitle) {
                $q->where('event_id', $eventId);
                if (! empty($eventTitle)) {
                    $q->orWhere('event_title', $eventTitle);
                }
            });

            $existingLead = (clone $query)->where('contact', $contact)->first();

            if (! $existingLead && strlen($cleanDigits) >= 8) {
                $suffix = substr($cleanDigits, -9);
                $existingLead = (clone $query)->where('contact', 'like', "%{$suffix}%")->first();
            }
        }

        // 4. Check for double submit within 10 minutes for same contact & source
        if (! $existingLead && ! empty($contact)) {
            $recentLead = Lead::where('contact', $contact)
                ->where('source', $source)
                ->where('created_at', '>=', now()->subMinutes(10))
                ->first();
            if ($recentLead) {
                $existingLead = $recentLead;
            }
        }

        // If an existing lead is found, update it instead of creating a duplicate
        if ($existingLead) {
            $updateData = [];

            if (! empty($name) && ($existingLead->name === '-' || strlen($name) >= strlen($existingLead->name))) {
                $updateData['name'] = $name;
            }
            if (! empty($contactType)) {
                $updateData['contact_type'] = $contactType;
            }
            if (! empty($contact)) {
                $updateData['contact'] = $contact;
            }
            if (! empty($eventId)) {
                $updateData['event_id'] = $eventId;
            }
            if (! empty($eventTitle)) {
                $updateData['event_title'] = $eventTitle;
            }
            if (! empty($hasAccount)) {
                $updateData['has_account'] = $hasAccount;
            }
            if (! empty($demoAcc)) {
                $updateData['demo_account_number'] = $demoAcc;
            }
            if (! empty($demoPass)) {
                $updateData['demo_investor_password'] = $demoPass;
            }
            if (! empty($screenshotReal)) {
                $updateData['screenshot_real_account'] = $screenshotReal;
            }
            if (! empty($screenshotTransfer)) {
                $updateData['screenshot_transfer'] = $screenshotTransfer;
            }
            if (! empty($level) && $level !== 'Pemula') {
                $updateData['level'] = $level;
            }
            if (! empty($source) && ($existingLead->source === 'Website' || str_contains($source, 'trading_account'))) {
                $updateData['source'] = $source;
            }
            if (! empty($notes)) {
                $updateData['notes'] = $existingLead->notes && ! str_contains($existingLead->notes, $notes)
                    ? ($existingLead->notes.' | '.$notes)
                    : ($existingLead->notes ?: $notes);
            }
            $updateData['submitted_at'] = now();

            $existingLead->update($updateData);

            AuditLog::create([
                'id' => 'audit-'.Str::uuid(),
                'action' => 'lead_updated',
                'details' => "Lead diperbarui: {$existingLead->name} ({$existingLead->contact})",
                'operator' => 'system',
                'timestamp' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran / Lead berhasil diperbarui.',
                'lead' => $existingLead->fresh(),
            ], 200);
        }

        // Otherwise create new lead (reusing client ID if provided)
        $id = ! empty($providedId) ? $providedId : ('lead-'.Str::uuid());

        $lead = Lead::create([
            'id' => $id,
            'name' => $name,
            'contact_type' => $contactType,
            'contact' => $contact,
            'level' => $level,
            'source' => $source,
            'submitted_at' => now(),
            'notes' => $notes,
            'event_id' => $eventId,
            'event_title' => $eventTitle,
            'has_account' => $hasAccount,
            'demo_account_number' => $demoAcc,
            'demo_investor_password' => $demoPass,
            'screenshot_real_account' => $screenshotReal,
            'screenshot_transfer' => $screenshotTransfer,
        ]);

        AuditLog::create([
            'id' => 'audit-'.Str::uuid(),
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
        if (! $lead) {
            $altId = str_starts_with($id, 'lead-') ? substr($id, 5) : 'lead-'.$id;
            $lead = Lead::find($altId);
        }

        if ($lead) {
            $contact = $lead->contact;
            $eventId = $lead->event_id;
            $demoAcc = $lead->demo_account_number;

            $lead->delete();

            // Also clean up any historical duplicate entries for this participant
            if (! empty($demoAcc) && strlen((string) $demoAcc) >= 4) {
                Lead::where('demo_account_number', $demoAcc)->delete();
            }
            if (! empty($eventId) && ! empty($contact)) {
                Lead::where('event_id', $eventId)->where('contact', $contact)->delete();
            }

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Lead tidak ditemukan'], 404);
    }

    public function clearAll(): JsonResponse
    {
        Lead::truncate();

        return response()->json(['success' => true, 'message' => 'Semua lead berhasil dihapus']);
    }

    public function participants(): JsonResponse
    {
        $rawParticipants = Lead::whereNotNull('event_id')
            ->orWhereNotNull('event_title')
            ->orWhereNotNull('demo_account_number')
            ->orWhereNotNull('has_account')
            ->orWhere('source', 'like', '%event%')
            ->orderBy('created_at', 'desc')
            ->get();

        $participants = self::deduplicateCollection($rawParticipants);

        return response()->json($participants->values());
    }
}
