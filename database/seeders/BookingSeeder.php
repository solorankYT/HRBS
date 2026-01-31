<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\BookingGuest;
use App\Models\BookingRoom;
use App\Models\Room;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Let's create 10 bookings
        for ($i = 0; $i < 10; $i++) {
            $checkIn = $faker->dateTimeBetween('+1 days', '+30 days');
            $checkOut = (clone $checkIn)->modify('+'.rand(1,5).' days');
            $numberOfGuests = rand(1, 3);

            $booking = Booking::create([
                'reference_number' => 'BK'.Str::upper(Str::random(8)), // unique reference number
                'check_in' => $checkIn->format('Y-m-d'),
                'check_out' => $checkOut->format('Y-m-d'),
                'number_of_guests' => $numberOfGuests,
                'special_requests' => $faker->sentence(),
                'booking_status' => 'pending',
                'total_amount' => 0,
            ]);

            for ($g = 0; $g < $numberOfGuests; $g++) {
                BookingGuest::create([
                    'booking_id' => $booking->id,
                    'name' => $faker->name(),
                    'email' => $faker->unique()->safeEmail(),
                    'phone' => $faker->phoneNumber(),
                    'special_requests' => $faker->optional()->sentence(),
                ]);
            }

            // Assign rooms
            $rooms = Room::inRandomOrder()->take(rand(1, 2))->get(); // pick 1-2 random rooms
            $total = 0;

            foreach ($rooms as $room) {
                $nights = $checkOut->diff($checkIn)->days;
                $subtotal = $room->price * $nights;
                $total += $subtotal;

                BookingRoom::create([
                    'booking_id' => $booking->id,
                    'room_id' => $room->id,
                    'price_per_night' => $room->price,
                    'nights' => $nights,
                    'subtotal' => $subtotal,
                ]);
            }

            $booking->update(['total_amount' => $total]);
        }
    }
}
