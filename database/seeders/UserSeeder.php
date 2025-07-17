<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Data admin utama
        DB::table('users')->insert([
            'name' => 'Administrator',
            'email' => 'tedysyhh07@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('password123'), // Ganti dengan password yang lebih kuat
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Data dummy menggunakan Faker
        \App\Models\User::factory(3)->create([
            'password' => Hash::make('user1234') // Password default untuk user dummy
        ]);
    }
}
