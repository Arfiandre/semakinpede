<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrokerController;
use App\Http\Controllers\DatabaseBackupController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes (Semakin Pede - Laravel + Inertia.js)
|--------------------------------------------------------------------------
*/

// Public Landing Page
Route::get('/', [LandingController::class, 'index'])->name('home');

// Public Leads Capture - Rate limited to 10 requests / minute per IP
Route::post('/api/leads', [LeadController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('leads.store');

// Superadmin Authentication
Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('login');

// Superadmin Login - Rate limited to 5 attempts / minute to prevent brute-force
Route::post('/admin/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1')
    ->name('admin.login');

// Protected Routes (Superadmin Only)
Route::middleware(['auth'])->group(function () {
    // Logout
    Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

    // Superadmin Dashboard
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.dashboard');

    // Protected API Endpoints for Admin Management
    Route::prefix('api')->group(function () {
        // Superadmin Security & Credential Management
        Route::post('/admin/security/password', [AuthController::class, 'changePassword'])
            ->middleware('throttle:10,1')
            ->name('admin.security.password');

        // Events CRUD
        Route::get('/events', [EventController::class, 'index'])->name('events.index');
        Route::post('/events', [EventController::class, 'store'])->name('events.store');
        Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');

        // Brokers CRUD
        Route::get('/brokers', [BrokerController::class, 'index'])->name('brokers.index');
        Route::post('/brokers', [BrokerController::class, 'store'])->name('brokers.store');
        Route::delete('/brokers/{id}', [BrokerController::class, 'destroy'])->name('brokers.destroy');

        // Leads Management
        Route::get('/leads', [LeadController::class, 'index'])->name('leads.index');
        Route::delete('/leads/{id}', [LeadController::class, 'destroy'])->name('leads.destroy');
        Route::delete('/leads', [LeadController::class, 'clearAll'])->name('leads.clearAll');

        // Site Settings
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

        // Database Backup & Restore
        Route::get('/database/export', [DatabaseBackupController::class, 'export'])->name('database.export');
        Route::post('/database/import', [DatabaseBackupController::class, 'import'])->name('database.import');
    });
});
