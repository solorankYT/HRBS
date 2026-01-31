<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoomSeeder::class,
            UserSeeder::class,
            BookingSeeder::class,
            PaymentSeeder::class,
            BookingRoomSeeder::class,
            BookingGuestSeeder::class,
        ]);
    }
}
