<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use App\Http\Controllers\ProfileController;

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

// API routes tetap
Route::prefix('api')->group(function () {
    Route::post('/device/register', [DeviceController::class, 'register']);
    Route::post('/device/status', [DeviceController::class, 'updateStatus']);
    Route::get('/device/status', [DeviceController::class, 'show']);
    Route::post('/sensor/status', [SensorController::class, 'logStatus']);
    Route::post('/logs', [RelayController::class, 'logEvent']);
});

// Web route untuk relay control
Route::middleware(['auth'])->group(function () {
    Route::post('/schedules', [ScheduleController::class, 'store']);
    Route::get('/schedules', [ScheduleController::class, 'index']);
    Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy']);
    Route::post('/control/relay', [RelayController::class, 'control']);
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/relay/logs', [RelayController::class, 'getLogs']);
    Route::get('/sensor/logs', [SensorController::class, 'getLogs']);
});

require __DIR__.'/auth.php';
