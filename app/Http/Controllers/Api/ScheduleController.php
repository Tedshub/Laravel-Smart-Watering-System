<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\Device;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    /**
     * Get all schedules
     */
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'device_id' => 'sometimes|exists:devices,id',
            'active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid request parameters',
                'errors' => $validator->errors()
            ], 400);
        }

        $query = Schedule::with('device')
            ->orderBy('hour')
            ->orderBy('minute');

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        if ($request->has('active')) {
            $query->where('active', $request->active);
        }

        $schedules = $query->get();

        return response()->json([
            'status' => 'success',
            'data' => $schedules
        ]);
    }

    /**
     * Create a new schedule
     */
    public function store(Request $request)
    {
        $device = $this->authenticateDevice($request);

        if (!$device) {
            $validator = Validator::make($request->all(), [
                'device_id' => 'required|exists:devices,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Device authentication failed',
                    'errors' => $validator->errors()
                ], 401);
            }

            $device = Device::find($request->device_id);
        }

        $validator = Validator::make($request->all(), [
            'hour' => 'required|integer|min:0|max:23',
            'minute' => 'required|integer|min:0|max:59',
            'active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid schedule data',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $schedule = Schedule::create([
                'device_id' => $device->id,
                'hour' => $request->hour,
                'minute' => $request->minute,
                'active' => $request->has('active') ? $request->active : true
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Schedule created',
                'data' => $schedule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create schedule'
            ], 500);
        }
    }

    /**
     * Update a schedule
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'status' => 'error',
                'message' => 'Schedule not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'hour' => 'sometimes|integer|min:0|max:23',
            'minute' => 'sometimes|integer|min:0|max:59',
            'active' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid schedule data',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            if ($request->has('hour')) {
                $schedule->hour = $request->hour;
            }

            if ($request->has('minute')) {
                $schedule->minute = $request->minute;
            }

            if ($request->has('active')) {
                $schedule->active = $request->active;
            }

            $schedule->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Schedule updated',
                'data' => $schedule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update schedule'
            ], 500);
        }
    }

    /**
     * Delete a schedule
     */
    public function destroy(Request $request, $id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return response()->json([
                'status' => 'error',
                'message' => 'Schedule not found'
            ], 404);
        }

        try {
            $schedule->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Schedule deleted'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete schedule'
            ], 500);
        }
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
