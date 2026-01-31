<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::first();

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => 7500,
            'reference' => 'GCASH-123456',
            'method' => 'gcash',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }
}
