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
        // Autentikasi
        $apiKey = $request->header('Authorization');
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization header missing'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $apiKey);
        $device = Device::where('api_key', $token)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid API Key'
            ], 401);
        }

        // Validasi data
        $validator = Validator::make($request->all(), [
            'sensors' => 'sometimes|array',
            'sensors.*.id' => 'required_with:sensors|integer|min:1|max:4',
            'sensors.*.status' => 'required_with:sensors|in:safe,raining',
            'sensors.*.duration_seconds' => 'nullable|integer|min:0',
            'device_id' => 'required|exists:devices,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid sensor data',
                'errors' => $validator->errors()
            ], 400);
        }

        // Cek apakah device_id sesuai dengan API key
        if ($request->device_id != $device->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device ID mismatch'
            ], 403);
        }

        try {
            if (empty($request->sensors)) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'No sensor data to log'
                ]);
            }

            foreach ($request->sensors as $sensorData) {
                SensorLog::create([
                    'device_id' => $request->device_id,
                    'sensor_number' => $sensorData['id'],
                    'status' => $sensorData['status'],
                    'duration_seconds' => $sensorData['duration_seconds'] ?? null,
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Sensor data logged successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to log sensor data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sensor logs (paginated)
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

        $query = SensorLog::with('device')->orderBy('created_at', 'desc');

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->has('sensor_number')) {
            $query->where('sensor_number', $request->sensor_number);
        }

        $limit = $request->get('limit', 20);
        $logs = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    /**
     * Get current status of all sensors for a device
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
                'last_updated' => SensorLog::where('device_id', $deviceId)->max('created_at')
            ]
        ]);
    }

    /**
     * Delete all sensor logs (with authentication)
     */
    public function deleteAllLogs(Request $request)
    {
        // Autentikasi
        $apiKey = $request->header('Authorization');
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization header missing'
            ], 401);
        }

        $token = str_replace('Bearer ', '', $apiKey);
        $device = Device::where('api_key', $token)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid API Key'
            ], 401);
        }

        try {
            // Hapus hanya data dari device yang terautentikasi
            $deletedCount = SensorLog::where('device_id', $device->id)->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'All sensor logs deleted successfully',
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete logs: ' . $e->getMessage()
            ], 500);
        }
    }
}
