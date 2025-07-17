<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeviceSeeder extends Seeder
{
    public function run()
    {
        DB::table('devices')->insert([
            'name' => 'Device Utama',
            'ip_address' => '192.168.1.100',
            'api_key' => 'd6f5s8a4d8f6s5a4f8',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
