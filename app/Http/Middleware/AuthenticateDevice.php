<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Device;

class AuthenticateDevice
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('Authorization')
            ? substr($request->header('Authorization'), 7)
            : $request->header('X-API-KEY');

        if (!$apiKey || !Device::where('api_key', $apiKey)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid device credentials'
            ], 401);
        }

        return $next($request);
    }
}
