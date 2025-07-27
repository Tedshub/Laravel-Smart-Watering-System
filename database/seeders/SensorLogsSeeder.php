<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SensorLogsSeeder extends Seeder
{
    public function run()
    {
        $logs = [
            [
                'device_id' => 1,
                'sensor_number' => 1,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:00:00',
                'updated_at' => '2023-06-01 08:00:00'
            ],
        ];

        DB::table('sensor_logs')->insert($logs);
    }
}
