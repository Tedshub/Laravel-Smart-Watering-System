<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Device;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DeviceController extends Controller
{

    /**
     * Get list of all devices with filtering (no authorization)
     */
    public function index(Request $request)
    {
        try {
            $query = Device::query();

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by name (search)
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Filter by date range
            if ($request->has('from_date') && $request->has('to_date')) {
                $query->whereBetween('created_at', [
                    Carbon::parse($request->from_date)->startOfDay(),
                    Carbon::parse($request->to_date)->endOfDay()
                ]);
            }

            // Sorting
            $sortField = $request->get('sort_field', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $devices = $query->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'data' => $devices->items(),
                'meta' => [
                    'total' => $devices->total(),
                    'per_page' => $devices->perPage(),
                    'current_page' => $devices->currentPage(),
                    'last_page' => $devices->lastPage(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve devices: ' . $e->getMessage()
            ], 500);
        }
    }


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
                    'api_key' => Str::random(60),
                    'status' => 'inactive'
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
                'message' => 'Device registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Validate device using API key
     */
    public function validateDevice(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['status' => 'unauthorized'], 401);
        }

        $apiKey = substr($authHeader, 7);
        $device = Device::where('api_key', $apiKey)->first();

        if ($device) {
            return response()->json(['status' => 'valid']);
        } else {
            return response()->json(['status' => 'not_found'], 404);
        }
    }

    /**
     * Update device status
     */
    public function updateStatus(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization header missing'
            ], 401);
        }

        $apiKey = substr($authHeader, 7);
        $device = Device::where('api_key', $apiKey)->first();

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Device not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive',
            'device_id' => 'required|numeric',
            'ip_address' => 'required|ip'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid data format',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $device->update([
                'status' => $request->status,
                'last_seen_at' => Carbon::now(),
                'ip_address' => $request->ip_address
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Status updated',
                'device_status' => $device->status
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get device information
     */
    public function show($id)  // Hapus Request $request
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
}
