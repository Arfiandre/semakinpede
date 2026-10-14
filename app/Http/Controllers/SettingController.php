<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $setting = SiteSetting::first();
        return response()->json($setting);
    }

    public function update(Request $request): JsonResponse
    {
        $setting = SiteSetting::first() ?: new SiteSetting();

        if ($request->has('projectTitle') || $request->has('project_title')) {
            $setting->project_title = $request->input('projectTitle') ?? $request->input('project_title');
        }
        if ($request->has('projectTagline') || $request->has('project_tagline')) {
            $setting->project_tagline = $request->input('projectTagline') ?? $request->input('project_tagline');
        }
        if ($request->has('projectDescription') || $request->has('project_description')) {
            $setting->project_description = $request->input('projectDescription') ?? $request->input('project_description');
        }
        if ($request->has('logoUrl') || $request->has('logo_url')) {
            $setting->logo_url = $request->input('logoUrl') ?? $request->input('logo_url');
        }
        if ($request->has('socialMedia') || $request->has('social_media')) {
            $setting->social_media = $request->input('socialMedia') ?? $request->input('social_media');
        }

        $setting->save();

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'settings_updated',
            'details' => 'Pengaturan landing page diperbarui',
            'operator' => auth()->user()?->username ?? 'superadmin',
            'timestamp' => now(),
        ]);

        return response()->json([
            'success' => true,
            'settings' => $setting,
        ]);
    }
}
