<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Broker;
use App\Models\EconomicNews;
use App\Models\Event;
use App\Models\Lead;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DatabaseBackupController extends Controller
{
    public function export(): JsonResponse
    {
        $snapshot = [
            'version' => 1,
            'exportedAt' => now()->toIso8601String(),
            'system' => 'Laravel MySQL/SQLite Database Engine',
            'tables' => [
                'leads' => Lead::all(),
                'events' => Event::all(),
                'brokers' => Broker::all(),
                'site_settings' => SiteSetting::first(),
                'forex_factory_news' => EconomicNews::all(),
                'audit_logs' => AuditLog::all(),
            ],
        ];

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'database_exported',
            'details' => 'Cadangan database penuh diunduh',
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->json($snapshot);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tables' => 'required|array',
        ]);

        $tables = $data['tables'];

        if (!empty($tables['events']) && is_array($tables['events'])) {
            foreach ($tables['events'] as $evt) {
                if (!empty($evt['id'])) {
                    Event::updateOrCreate(['id' => $evt['id']], $evt);
                }
            }
        }

        if (!empty($tables['brokers']) && is_array($tables['brokers'])) {
            foreach ($tables['brokers'] as $brk) {
                if (!empty($brk['id'])) {
                    Broker::updateOrCreate(['id' => $brk['id']], $brk);
                }
            }
        }

        if (!empty($tables['leads']) && is_array($tables['leads'])) {
            foreach ($tables['leads'] as $ld) {
                if (!empty($ld['id'])) {
                    Lead::updateOrCreate(['id' => $ld['id']], $ld);
                }
            }
        }

        if (!empty($tables['site_settings']) && is_array($tables['site_settings'])) {
            $settingData = $tables['site_settings'];
            unset($settingData['id']);
            SiteSetting::updateOrCreate(['id' => 1], $settingData);
        }

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'database_restored',
            'details' => 'Pemulihan cadangan data berhasil dijalankan',
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cadangan database berhasil dipulihkan.',
        ]);
    }
}
