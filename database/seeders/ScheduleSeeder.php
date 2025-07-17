<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScheduleSeeder extends Seeder
{
    public function run()
    {
        $schedules = [
            [
                'device_id' => 1,
                'hour' => 6,
                'minute' => 30,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'device_id' => 1,
                'hour' => 12,
                'minute' => 0,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'device_id' => 1,
                'hour' => 15,
                'minute' => 45,
                'active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'device_id' => 1,
                'hour' => 18,
                'minute' => 15,
                'active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'device_id' => 1,
                'hour' => 21,
                'minute' => 0,
                'active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('schedules')->insert($schedules);
    }
}
