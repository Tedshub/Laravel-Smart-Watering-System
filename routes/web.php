<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Tambahan controller IoT
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\RelayController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\DashboardController;

// Inertia Frontend Routes
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard route via Inertia + React
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard1');
})->middleware(['auth', 'verified'])->name('dashboard');

// API routes
Route::prefix('api')->middleware(['auth', 'web'])->group(function () {
    Route::get('/device/status', [DeviceController::class, 'show']);
    Route::get('/sensor/status', [SensorController::class, 'getStatus']);

    Route::post('/control/relay', [RelayController::class, 'control']);
});

// Authenticated routes
Route::middleware(['auth', 'web'])->group(function () {
    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);

    Route::get('/relay/logs', [RelayController::class, 'getLogs']);
    Route::delete('/relay/logs', [RelayController::class, 'deleteAllLogs']);
    Route::get('/sensor/logs', [SensorController::class, 'getLogs']);
    Route::delete('/sensor/logs', [SensorController::class, 'deleteAllLogs']);
    Route::delete('/sensor-logs/{id}', [SensorController::class, 'destroy']);


    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Logout route - penting untuk menggunakan middleware 'web'
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

require __DIR__.'/auth.php';
