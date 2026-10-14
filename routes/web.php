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

// Public Leads Capture (LeadForm, MobileStickyForm, EventRegistrationModal)
Route::post('/api/leads', [LeadController::class, 'store'])->name('leads.store');

// Superadmin Authentication
Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/admin/login', [AuthController::class, 'login'])->name('admin.login');
Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

// Superadmin Panel
Route::get('/admin', [AdminController::class, 'index'])->name('admin.dashboard');

// API routes for CRUD & Management
Route::prefix('api')->group(function () {
    // Events
    Route::get('/events', [EventController::class, 'index'])->name('events.index');
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');

    // Brokers
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

    // Database Backup
    Route::get('/database/export', [DatabaseBackupController::class, 'export'])->name('database.export');
    Route::post('/database/import', [DatabaseBackupController::class, 'import'])->name('database.import');
});
