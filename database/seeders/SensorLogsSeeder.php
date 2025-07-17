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
                'status' => 'safe',
                'created_at' => '2023-06-01 08:00:00',
                'updated_at' => '2023-06-01 08:00:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 2,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:05:00',
                'updated_at' => '2023-06-01 08:05:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 3,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:10:00',
                'updated_at' => '2023-06-01 08:10:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 4,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:15:00',
                'updated_at' => '2023-06-01 08:15:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 1,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:20:00',
                'updated_at' => '2023-06-01 08:20:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 2,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:25:00',
                'updated_at' => '2023-06-01 08:25:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 3,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:30:00',
                'updated_at' => '2023-06-01 08:30:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 4,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:35:00',
                'updated_at' => '2023-06-01 08:35:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 1,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:40:00',
                'updated_at' => '2023-06-01 08:40:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 2,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:45:00',
                'updated_at' => '2023-06-01 08:45:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 3,
                'status' => 'raining',
                'created_at' => '2023-06-01 08:50:00',
                'updated_at' => '2023-06-01 08:50:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 4,
                'status' => 'safe',
                'created_at' => '2023-06-01 08:55:00',
                'updated_at' => '2023-06-01 08:55:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 1,
                'status' => 'raining',
                'created_at' => '2023-06-01 09:00:00',
                'updated_at' => '2023-06-01 09:00:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 2,
                'status' => 'raining',
                'created_at' => '2023-06-01 09:05:00',
                'updated_at' => '2023-06-01 09:05:00'
            ],
            [
                'device_id' => 1,
                'sensor_number' => 3,
                'status' => 'safe',
                'created_at' => '2023-06-01 09:10:00',
                'updated_at' => '2023-06-01 09:10:00'
            ],
        ];

        DB::table('sensor_logs')->insert($logs);
    }
}
