<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\SensorLog;
use App\Models\RelayLog;
use App\Models\Schedule;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Show the application dashboard
     */
    public function index()
    {
        $device = Device::first(); // Assuming single device for simplicity

        if (!$device) {
            return view('dashboard')->with('error', 'No devices registered');
        }

        // Get latest sensor status
        $sensorStatus = [];
        for ($i = 1; $i <= 4; $i++) {
            $log = SensorLog::where('device_id', $device->id)
                ->where('sensor_number', $i)
                ->orderBy('created_at', 'desc')
                ->first();

            $sensorStatus[$i] = $log ? $log->status : 'unknown';
        }

        // Get latest relay status
        $relayLog = RelayLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->first();

        $relayStatus = $relayLog ? $relayLog->action : 'unknown';

        // Get schedules
        $schedules = Schedule::where('device_id', $device->id)
            ->where('active', true)
            ->orderBy('hour')
            ->orderBy('minute')
            ->get();

        // Get recent logs
        $sensorLogs = SensorLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $relayLogs = RelayLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('dashboard', [
            'device' => $device,
            'sensorStatus' => $sensorStatus,
            'relayStatus' => $relayStatus,
            'schedules' => $schedules,
            'sensorLogs' => $sensorLogs,
            'relayLogs' => $relayLogs,
            'lastUpdated' => Carbon::now()->format('Y-m-d H:i:s')
        ]);
    }

    /**
     * Get current device status (AJAX)
     */
    public function getStatus(Request $request)
    {
        $device = Device::first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        // Get latest relay status
        $relayLog = RelayLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->first();

        $relayStatus = [
            'active' => $relayLog && in_array($relayLog->action, ['activated', 'scheduled']),
            'action' => $relayLog ? $relayLog->action : 'unknown',
            'duration' => $relayLog ? $relayLog->duration_seconds : 0,
            'last_updated' => $relayLog ? $relayLog->created_at->format('Y-m-d H:i:s') : null
        ];

        // Get sensor status
        $sensorStatus = [];
        for ($i = 1; $i <= 4; $i++) {
            $log = SensorLog::where('device_id', $device->id)
                ->where('sensor_number', $i)
                ->orderBy('created_at', 'desc')
                ->first();

            $sensorStatus[$i] = $log ? $log->status : 'unknown';
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'device' => $device,
                'relay' => $relayStatus,
                'sensors' => $sensorStatus,
                'last_updated' => Carbon::now()->format('Y-m-d H:i:s')
            ]
        ]);
    }

    /**
     * Control the relay
     */
    public function controlRelay(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate',
            'duration' => 'required_if:action,activate|integer|min:1'
        ]);

        $device = Device::first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        // In a real implementation, you would send this command to the ESP32
        // For now, we'll just log it

        $action = $request->action == 'activate' ? 'activated' : 'deactivated';

        RelayLog::create([
            'device_id' => $device->id,
            'action' => $action,
            'duration_seconds' => $request->duration ?? null
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Relay command sent'
        ]);
    }

    /**
     * Get sensor history
     */
    public function getSensorHistory(Request $request)
    {
        $device = Device::first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        $logs = SensorLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    /**
     * Get relay history
     */
    public function getRelayHistory(Request $request)
    {
        $device = Device::first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        $logs = RelayLog::where('device_id', $device->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }
}
