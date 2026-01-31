<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\Room;
use Illuminate\Database\Seeder;

class BookingRoomSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::first();
        $room = Room::where('room_number', '101')->first();

        $nights = 3;
        $price = $room->price;

        BookingRoom::create([
            'booking_id' => $booking->id,
            'room_id' => $room->id,
            'price_per_night' => $price,
            'nights' => $nights,
            'subtotal' => $price * $nights,
        ]);
    }
}
