<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Booking;
use App\Models\Room;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $room = Room::first();

        Booking::create([
            'room_id' => $room->id,
            'guest_name' => 'Juan Dela Cruz',
            'guest_email' => 'juan@test.com',
            'guest_phone' => '09123456789',
            'check_in' => now()->addDay(),
            'check_out' => now()->addDays(3),
            'booking_status' => 'confirmed',
        ]);
    }
}
