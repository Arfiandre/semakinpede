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
        $id = $request->input('id') ?: 'broker-' . Str::uuid();

        $data = $request->except(['_token']);
        $data['id'] = $id;

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
