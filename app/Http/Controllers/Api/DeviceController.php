<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class DeviceController extends Controller
{
    /**
     * Register a new device
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ip' => 'required|ip'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid IP address'
            ], 400);
        }

        try {
            $device = Device::firstOrCreate(
                ['ip_address' => $request->ip],
                [
                    'name' => 'Smart Watering Device - ' . Str::random(4),
                    'api_key' => Str::random(60)
                ]
            );

            return response()->json([
                'status' => 'success',
                'api_key' => $device->api_key,
                'device_id' => $device->id
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device registration failed'
            ], 500);
        }
    }

    /**
     * Update device status
     */
    public function updateStatus(Request $request)
    {
        $device = $this->authenticateDevice($request);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'relay_active' => 'sometimes|boolean',
            'relay_scheduled' => 'sometimes|boolean',
            'relay_duration' => 'sometimes|integer|min:0',
            'schedules' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid data format',
                'errors' => $validator->errors()
            ], 400);
        }

        // Here you could store the device status in the database if needed
        // For now, we'll just acknowledge the update

        return response()->json([
            'status' => 'success',
            'message' => 'Status updated'
        ]);
    }

    /**
     * Get device information
     */
    public function show(Request $request, $id)
    {
        $device = Device::find($id);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $device
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
