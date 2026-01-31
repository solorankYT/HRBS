<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingGuest;
use Illuminate\Database\Seeder;

class BookingGuestSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::first();

        BookingGuest::create([
            'booking_id' => $booking->id,
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'phone' => '09123456789',
            'special_requests' => 'Near elevator',
        ]);

        BookingGuest::create([
            'booking_id' => $booking->id,
            'name' => 'Maria Dela Cruz',
            'email' => 'maria@example.com',
            'phone' => '09987654321',
        ]);
    }
}
