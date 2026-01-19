<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Payment;
use App\Models\Booking;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::first();

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => 3000,
            'method' => 'cash',
            'status' => 'paid',
        ]);
    }
}
