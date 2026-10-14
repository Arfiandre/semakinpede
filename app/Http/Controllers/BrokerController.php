<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Broker;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrokerController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Broker::orderBy('order', 'asc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'shortName' => 'nullable|string|max:50',
            'license_number' => 'nullable|string|max:255',
            'licenseNumber' => 'nullable|string|max:255',
            'status_badge' => 'nullable|string|max:100',
            'statusBadge' => 'nullable|string|max:100',
            'tagline' => 'required|string|max:255',
            'description' => 'required|string|max:3000',
            'logo_url' => 'nullable|string|max:3000000',
            'logoUrl' => 'nullable|string|max:3000000',
            'highlights' => 'nullable|array',
            'action_text' => 'nullable|string|max:100',
            'actionText' => 'nullable|string|max:100',
            'action_url' => 'nullable|string|max:500',
            'actionUrl' => 'nullable|string|max:500',
            'official_site_url' => 'nullable|string|max:500',
            'officialSiteUrl' => 'nullable|string|max:500',
            'is_featured' => 'nullable|boolean',
            'isFeatured' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0',
        ]);

        $id = $validated['id'] ?? ('broker-' . Str::uuid());

        $data = [
            'id' => $id,
            'name' => strip_tags(trim($validated['name'])),
            'short_name' => strip_tags(trim($validated['short_name'] ?? $validated['shortName'] ?? '')),
            'license_number' => strip_tags(trim($validated['license_number'] ?? $validated['licenseNumber'] ?? '')),
            'status_badge' => strip_tags(trim($validated['status_badge'] ?? $validated['statusBadge'] ?? 'Mitra Resmi')),
            'tagline' => strip_tags(trim($validated['tagline'])),
            'description' => strip_tags(trim($validated['description'])),
            'logo_url' => $validated['logo_url'] ?? $validated['logoUrl'] ?? null,
            'highlights' => $validated['highlights'] ?? [],
            'action_text' => strip_tags(trim($validated['action_text'] ?? $validated['actionText'] ?? 'Daftar')),
            'action_url' => $validated['action_url'] ?? $validated['actionUrl'] ?? '#',
            'official_site_url' => $validated['official_site_url'] ?? $validated['officialSiteUrl'] ?? 'https://bappebti.go.id',
            'is_featured' => $validated['is_featured'] ?? $validated['isFeatured'] ?? false,
            'order' => $validated['order'] ?? 1,
        ];

        $broker = Broker::updateOrCreate(['id' => $id], $data);

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'broker_saved',
            'details' => 'Data pialang disimpan: ' . $broker->name,
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'broker' => $broker,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $broker = Broker::find($id);
        if ($broker) {
            $name = $broker->name;
            $broker->delete();

            AuditLog::create([
                'id' => 'audit-' . Str::uuid(),
                'action' => 'broker_deleted',
                'details' => 'Data pialang dihapus: ' . $name,
                'operator' => auth()->user()?->username ?? 'superadmin',
                'timestamp' => now(),
            ]);

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'Pialang tidak ditemukan'], 404);
    }
}
