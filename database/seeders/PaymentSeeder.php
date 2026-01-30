<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Booking;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $booking = Booking::first();

        if (!$booking) {
            return;
        }

        Payment::create([
            'booking_id' => $booking->id,
            'amount' => $booking->total_amount,
            'reference' => 'GCASH-REF-001',
            'method' => 'gcash',
            'status' => 'paid',
            'paid_at' => Carbon::now(),
        ]);
    }
}
