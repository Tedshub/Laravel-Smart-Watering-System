<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RelayLogsSeeder extends Seeder
{
    public function run()
    {
        // Pastikan device_id yang digunakan sudah ada di tabel devices
        $deviceId = DB::table('devices')->first()->id;

        $logs = [
            [
                'device_id' => $deviceId,
                'action' => 'activated',
                'duration_seconds' => 300,
                'created_at' => Carbon::now()->subHours(5),
                'updated_at' => Carbon::now()->subHours(5)
            ],
            [
                'device_id' => $deviceId,
                'action' => 'deactivated',
                'duration_seconds' => null,
                'created_at' => Carbon::now()->subHours(4, 30),
                'updated_at' => Carbon::now()->subHours(4, 30)
            ],
            [
                'device_id' => $deviceId,
                'action' => 'scheduled',
                'duration_seconds' => 600,
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3)
            ],
            [
                'device_id' => $deviceId,
                'action' => 'activated',
                'duration_seconds' => 450,
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2)
            ],
            [
                'device_id' => $deviceId,
                'action' => 'deactivated',
                'duration_seconds' => null,
                'created_at' => Carbon::now()->subHour(),
                'updated_at' => Carbon::now()->subHour()
            ],
            [
                'device_id' => $deviceId,
                'action' => 'scheduled',
                'duration_seconds' => 900,
                'created_at' => Carbon::now()->subMinutes(30),
                'updated_at' => Carbon::now()->subMinutes(30)
            ]
        ];

        DB::table('relay_logs')->insert($logs);
    }
}
