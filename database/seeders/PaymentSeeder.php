<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\Carbon;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $booking1 = Booking::where('guest_name', 'John Doe')->first();
        $booking2 = Booking::where('guest_name', 'Jane Smith')->first();

        Payment::create([
            'booking_id' => $booking1->id,
            'amount' => $booking1->total_amount,
            'reference' => 'PAY123456',
            'method' => 'card',
            'status' => 'paid',
            'paid_at' => Carbon::now(),
        ]);

        Payment::create([
            'booking_id' => $booking2->id,
            'amount' => 50.00,
            'reference' => 'PAY654321',
            'method' => 'gcash',
            'status' => 'pending',
            'paid_at' => null,
        ]);
    }
}
