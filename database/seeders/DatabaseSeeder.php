<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Schedule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Jalankan UserSeeder terlebih dahulu
        $this->call([
            UserSeeder::class,
            DeviceSeeder::class,
            SensorLogsSeeder::class,
            RelayLogsSeeder::class,
            ScheduleSeeder::class,
        ]);

        // Tambahkan user test tambahan jika diperlukan
        \App\Models\User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'), // Tambahkan password
            'email_verified_at' => now(), // Verifikasi email
        ]);

        // Jika ingin membuat user dummy tambahan
        // \App\Models\User::factory(5)->create();
    }
}
