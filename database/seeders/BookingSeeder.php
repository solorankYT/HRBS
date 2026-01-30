<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $room = Room::where('status', 'available')->first();

        if (!$room) {
            return;
        }

        Booking::create([
            'room_id' => $room->id,
            'guest_name' => 'Juan Dela Cruz',
            'guest_email' => 'juan@example.com',
            'guest_phone' => '09123456789',
            'check_in' => Carbon::now()->addDays(3),
            'check_out' => Carbon::now()->addDays(5),
            'number_of_guests' => 2,
            'special_requests' => 'Late check-in requested',
            'booking_status' => 'confirmed',
            'total_amount' => 5000,
        ]);

        Booking::create([
            'room_id' => $room->id,
            'guest_name' => 'Maria Santos',
            'guest_email' => 'maria@example.com',
            'guest_phone' => '09987654321',
            'check_in' => Carbon::now()->addDays(10),
            'check_out' => Carbon::now()->addDays(12),
            'number_of_guests' => 1,
            'special_requests' => null,
            'booking_status' => 'pending',
            'total_amount' => 5000,
        ]);
    }
}
