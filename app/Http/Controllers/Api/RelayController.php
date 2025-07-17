<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RelayLog;
use App\Models\Device;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class RelayController extends Controller
{
    /**
     * Log relay events
     */
    public function logEvent(Request $request)
    {
        $device = $this->authenticateDevice($request);

        if (!$device) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'event' => 'required|in:manual_activation,schedule_triggered,schedule_added,deactivation',
            'duration' => 'required_if:event,manual_activation,schedule_triggered|integer|min:1',
            'hour' => 'required_if:event,schedule_added|integer|min:0|max:23',
            'minute' => 'required_if:event,schedule_added|integer|min:0|max:59'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid event data',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $action = '';
            $duration = null;

            switch ($request->event) {
                case 'manual_activation':
                    $action = 'activated';
                    $duration = $request->duration;
                    break;
                case 'schedule_triggered':
                    $action = 'scheduled';
                    $duration = $request->duration;
                    break;
                case 'deactivation':
                    $action = 'deactivated';
                    break;
                case 'schedule_added':
                    // This would be handled by ScheduleController
                    break;
            }

            if ($action) {
                RelayLog::create([
                    'device_id' => $device->id,
                    'action' => $action,
                    'duration_seconds' => $duration
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Event logged'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to log event'
            ], 500);
        }
    }

    /**
     * Get relay logs
     */
    public function getLogs(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'sometimes|exists:devices,id',
            'limit' => 'sometimes|integer|min:1|max:100',
            'action' => 'sometimes|in:activated,deactivated,scheduled',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid request parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $query = RelayLog::with('device')
            ->orderBy('created_at', 'desc');

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', Carbon::parse($request->date_from));
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', Carbon::parse($request->date_to)->endOfDay());
        }

        $limit = $request->has('limit') ? $request->limit : 20;
        $logs = $query->paginate($limit);

        return response()->json([
            'status' => 'success',
            'data' => $logs
        ]);
    }

    /**
     * Control relay manually
     */
    public function control(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:activate,deactivate',
            'duration' => 'required_if:action,activate|integer|min:1'
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // In a real implementation, you would send this command to the ESP32
        // For now, we'll just log it

        $device = Device::first(); // Assuming single device for simplicity
        $action = $request->action == 'activate' ? 'activated' : 'deactivated';

        RelayLog::create([
            'device_id' => $device->id,
            'action' => $action,
            'duration_seconds' => $request->duration ?? null
        ]);

        return back()->with('status', 'Relay ' . $action . ' successfully');
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
