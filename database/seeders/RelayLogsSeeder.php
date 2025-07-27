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
            ]
        ];

        DB::table('relay_logs')->insert($logs);
    }
}
