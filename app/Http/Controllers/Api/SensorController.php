<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SensorLog;
use App\Models\Device;
use Illuminate\Support\Facades\Validator;

class SensorController extends Controller
{
    /**
     * Log sensor status
     */
    public function logStatus(Request $request)
    {
        $device = $this->authenticateDevice($request);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'sensors' => 'required|array',
            'sensors.*.id' => 'required|integer|min:1|max:4',
            'sensors.*.status' => 'required|in:safe,raining'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid sensor data',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            foreach ($request->sensors as $sensorData) {
                SensorLog::create([
                    'device_id' => $device->id,
                    'sensor_number' => $sensorData['id'],
                    'status' => $sensorData['status']
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Sensor data logged'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to log sensor data'
            ], 500);
        }
    }

    /**
     * Get sensor logs
     */
    public function getLogs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'sometimes|exists:devices,id',
            'limit' => 'sometimes|integer|min:1|max:100',
            'sensor_number' => 'sometimes|integer|min:1|max:4'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid request parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $query = SensorLog::with('device')
            ->orderBy('created_at', 'desc');

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->has('sensor_number')) {
            $query->where('sensor_number', $request->sensor_number);
        }

        $limit = $request->has('limit') ? $request->limit : 20;
        $logs = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    /**
     * Get current sensor status
     */
    public function getCurrentStatus(Request $request, $deviceId)
    {
        $device = Device::find($deviceId);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        $latestLogs = [];
        for ($i = 1; $i <= 4; $i++) {
            $log = SensorLog::where('device_id', $deviceId)
                ->where('sensor_number', $i)
                ->orderBy('created_at', 'desc')
                ->first();

            $latestLogs[$i] = $log ? $log->status : 'unknown';
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'device_id' => $deviceId,
                'sensors' => $latestLogs,
                'last_updated' => SensorLog::where('device_id', $deviceId)
                    ->max('created_at')
            ]
        ]);
    }

    /**
     * Authenticate device using API key
     */
    private function authenticateDevice(Request $request)
    {
        $apiKey = $request->header('X-API-KEY');

        if (!$apiKey) {
            return null;
        }

        return Device::where('api_key', $apiKey)->first();
    }
}
