<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'reference_number',
        'check_in',
        'check_out',
        'number_of_guests',
        'special_requests',
        'booking_status',
        'payment_status',
        'total_amount',
    ];

    public function rooms()
    {
        return $this->hasMany(BookingRoom::class);
    }

    public function guests()
    {
        return $this->hasMany(BookingGuest::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
