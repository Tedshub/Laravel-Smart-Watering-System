<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\RelayController;
use App\Http\Controllers\Api\SensorController;

Route::post('/device/register', [DeviceController::class, 'register']);
Route::get('/device/validate', [DeviceController::class, 'validateDevice']);
Route::post('/device/status', [DeviceController::class, 'updateStatus']);
Route::get('/device/status', [DeviceController::class, 'show']);

Route::get('/devices', [DeviceController::class, 'index']);
Route::get('/device/{id}', [DeviceController::class, 'show']);  // Untuk get device by ID
Route::get('/device/status/{id}', [DeviceController::class, 'show']);  // Alternatif jika ingin path yang lebih deskriptif


Route::get('/schedules', [ScheduleController::class, 'index']);

Route::post('/relay/log', [RelayController::class, 'logEvent']);
Route::get('/sensor/logs', [SensorController::class, 'getLogs']);
Route::post('/sensor/log', [SensorController::class, 'logStatus']);
