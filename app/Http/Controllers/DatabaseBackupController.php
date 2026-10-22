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
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedJsonResponse;

class DatabaseBackupController extends Controller
{
    public function export(): StreamedJsonResponse
    {
        AuditLog::create([
            'id' => 'audit-'.Str::uuid(),
            'action' => 'database_exported',
            'details' => 'Cadangan data aplikasi diunduh',
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->streamJson([
            'version' => 1,
            'exportedAt' => now()->toIso8601String(),
            'system' => 'Laravel MySQL/SQLite Database Engine',
            'tables' => [
                'leads' => Lead::query()->lazyById(1)->getIterator(),
                'events' => Event::query()->lazyById(1)->getIterator(),
                'brokers' => Broker::query()->lazyById(1)->getIterator(),
                'site_settings' => SiteSetting::first(),
                'forex_factory_news' => EconomicNews::query()->lazyById(100)->getIterator(),
                'audit_logs' => AuditLog::query()->lazyById(100)->getIterator(),
            ],
        ], headers: [
            'Cache-Control' => 'private, no-store',
            'Content-Disposition' => 'attachment; filename="semakinpede-database-backup-'.now()->format('Y-m-d-His').'.json"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $data = $request->validate($this->importRules(), [
            'tables.array' => 'Berkas cadangan berisi tabel yang tidak didukung.',
            'version.in' => 'Versi berkas cadangan tidak didukung.',
        ]);

        $result = DB::transaction(function () use ($data): array {
            $result = ['restored' => 0, 'skipped' => 0];

            foreach ([
                'events' => Event::class,
                'brokers' => Broker::class,
                'leads' => Lead::class,
                'forex_factory_news' => EconomicNews::class,
                'audit_logs' => AuditLog::class,
            ] as $table => $model) {
                foreach ($data['tables'][$table] ?? [] as $attributes) {
                    $record = $model::firstOrCreate(['id' => $attributes['id']], $attributes);
                    $result[$record->wasRecentlyCreated ? 'restored' : 'skipped']++;
                }
            }

            if (! empty($data['tables']['site_settings'])) {
                if (SiteSetting::query()->exists()) {
                    $result['skipped']++;
                } else {
                    $setting = SiteSetting::firstOrCreate(['id' => 1], Arr::except($data['tables']['site_settings'], 'id'));
                    $result[$setting->wasRecentlyCreated ? 'restored' : 'skipped']++;
                }
            }

            AuditLog::create([
                'id' => 'audit-'.Str::uuid(),
                'action' => 'database_restored',
                'details' => "Pemulihan tambahan: {$result['restored']} data ditambahkan, {$result['skipped']} data terkini dipertahankan",
                'operator' => auth()->user()?->username ?? 'superadmin',
                'timestamp' => now(),
            ]);

            return $result;
        });

        return response()->json([
            'success' => true,
            'message' => "{$result['restored']} data dipulihkan. {$result['skipped']} data yang sudah ada dipertahankan tanpa perubahan.",
            ...$result,
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function importRules(): array
    {
        $rules = [
            'version' => 'sometimes|integer|in:1',
            'tables' => 'required|array:leads,events,brokers,site_settings,forex_factory_news,audit_logs|min:1',
        ];

        foreach ($this->tableFields() as $table => $fields) {
            $fields += ['created_at' => 'nullable|date', 'updated_at' => 'nullable|date'];
            $isSetting = $table === 'site_settings';
            $path = $isSetting ? "tables.{$table}" : "tables.{$table}.*";
            $rules["tables.{$table}"] = $isSetting ? 'sometimes|nullable|array:'.implode(',', array_keys($fields)) : 'sometimes|array|list';

            if (! $isSetting) {
                $rules[$path] = 'required|array:'.implode(',', array_keys($fields));
            }

            foreach ($fields as $field => $fieldRules) {
                $rules["{$path}.{$field}"] = $isSetting ? 'sometimes|'.$fieldRules : $fieldRules;
            }
        }

        $rules['tables.events.*.key_takeaways.*'] = 'string|max:5000';
        $rules['tables.brokers.*.highlights.*'] = 'string|max:5000';

        return $rules;
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function tableFields(): array
    {
        $id = 'required|string|max:255|distinct:strict';
        $string = 'nullable|string|max:255';
        $text = 'nullable|string|max:65535';
        $image = 'nullable|string|max:6990600';

        return [
            'events' => [
                'id' => $id, 'title' => 'required|string|max:255', 'date' => 'required|string|max:255',
                'poster_image' => $image, 'time' => $string, 'description' => $text,
                'category' => 'sometimes|required|string|max:255', 'status' => 'sometimes|required|in:ongoing,upcoming,past',
                'location' => $string, 'speaker' => $string, 'start_date' => 'nullable|date', 'end_date' => 'nullable|date',
                'start_time' => $string, 'end_time' => $string, 'meeting_url' => $string, 'trading_session' => $string,
                'target_instrument' => $string, 'trading_platform' => $string, 'workshop_subtype' => $string,
                'prize_pool' => $string, 'max_drawdown' => $string, 'registration_deadline' => $string,
                'venue_city' => $string, 'venue_address' => $text, 'seat_quota' => 'nullable|integer|min:0',
                'key_takeaways' => 'nullable|array|list', 'attendees_count' => $string, 'action_text' => $string,
                'action_type' => $string, 'recap_note' => $text, 'telegram_group_url' => $string, 'tutorial_account_url' => $string,
            ],
            'brokers' => [
                'id' => $id, 'name' => 'required|string|max:255', 'short_name' => 'required|string|max:255',
                'logo_url' => $image, 'license_number' => 'required|string|max:255',
                'status_badge' => 'sometimes|required|string|max:255', 'tagline' => 'required|string|max:255',
                'description' => 'required|string|max:65535', 'highlights' => 'nullable|array|list',
                'action_text' => 'sometimes|required|string|max:255', 'action_url' => 'required|string|max:255',
                'official_site_url' => 'sometimes|required|string|max:255', 'is_featured' => 'sometimes|boolean',
                'order' => 'sometimes|integer',
            ],
            'leads' => [
                'id' => $id, 'name' => 'required|string|max:255', 'contact_type' => 'required|in:wa,telegram,email',
                'contact' => 'required|string|max:255', 'level' => 'sometimes|required|string|max:255',
                'source' => 'sometimes|required|string|max:255', 'submitted_at' => 'nullable|date', 'notes' => $text,
                'event_id' => $string, 'event_title' => $string, 'has_account' => $string,
                'demo_account_number' => $string, 'demo_investor_password' => $string,
                'screenshot_real_account' => $image, 'screenshot_transfer' => $image,
            ],
            'site_settings' => [
                'id' => 'integer|min:1', 'project_title' => 'required|string|max:255',
                'project_tagline' => 'required|string|max:255', 'project_description' => $text,
                'logo_url' => $image, 'social_media' => 'nullable|array',
            ],
            'forex_factory_news' => [
                'id' => $id, 'title' => 'required|string|max:255', 'country' => 'required|string|max:255',
                'date_raw' => $string, 'time_formatted' => $string, 'date_formatted' => $string,
                'day_name' => $string, 'impact' => 'sometimes|required|string|max:255',
                'forecast' => $string, 'previous' => $string, 'source' => 'sometimes|required|string|max:255',
            ],
            'audit_logs' => [
                'id' => $id, 'action' => 'required|string|max:255', 'details' => $text,
                'operator' => $string, 'timestamp' => 'sometimes|required|date',
            ],
        ];
    }
}
