<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Login');
    }

    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'remember' => 'nullable|boolean',
        ]);

        $loginField = filter_var($credentials['username'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $attemptData = [
            $loginField => $credentials['username'],
            'password' => $credentials['password'],
        ];

        $remember = $request->boolean('remember', true);

        if (Auth::attempt($attemptData, $remember)) {
            $request->session()->regenerate();

            AuditLog::create([
                'id' => 'audit-' . Str::uuid(),
                'action' => 'admin_login_success',
                'details' => 'Superadmin berhasil login',
                'operator' => Auth::user()->username ?? Auth::user()->name,
                'timestamp' => now(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'user' => Auth::user(),
                    'redirect' => route('admin.dashboard'),
                ]);
            }

            return redirect()->intended(route('admin.dashboard'));
        }

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'admin_login_failed',
            'details' => 'Percobaan login gagal untuk username: ' . $credentials['username'],
            'operator' => 'unknown',
            'timestamp' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau password superadmin salah.',
            ], 422);
        }

        return back()->withErrors([
            'username' => 'Username atau password salah.',
        ]);
    }

    public function logout(Request $request): RedirectResponse|JsonResponse
    {
        $operator = Auth::user()?->username ?? 'superadmin';

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        AuditLog::create([
            'id' => 'audit-' . Str::uuid(),
            'action' => 'admin_logout',
            'details' => 'Superadmin keluar dari sistem',
            'operator' => $operator,
            'timestamp' => now(),
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('home');
    }
}
