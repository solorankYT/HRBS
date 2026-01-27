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
        $room1 = Room::where('room_number', '101')->first();
        $room2 = Room::where('room_number', '102')->first();

        Booking::create([
            'room_id' => $room1->id,
            'guest_name' => 'John Doe',
            'guest_email' => 'johndoe@example.com',
            'guest_phone' => '09123456789',
            'check_in' => Carbon::today()->addDays(1),
            'check_out' => Carbon::today()->addDays(3),
            'number_of_guests' => 1,
            'special_requests' => 'Late check-in',
            'booking_status' => 'confirmed',
            'total_amount' => $room1->price * 2,
        ]);

        Booking::create([
            'room_id' => $room2->id,
            'guest_name' => 'Jane Smith',
            'guest_email' => 'janesmith@example.com',
            'guest_phone' => '09987654321',
            'check_in' => Carbon::today()->addDays(2),
            'check_out' => Carbon::today()->addDays(5),
            'number_of_guests' => 2,
            'special_requests' => null,
            'booking_status' => 'pending',
            'total_amount' => $room2->price * 3,
        ]);
    }
}
