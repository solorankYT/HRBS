<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'check_in',
        'check_out',
        'number_of_guests',
        'special_requests',
        'booking_status',
        'total_amount',
    ];

    protected $dates = [
        'check_in',
        'check_out',
        'created_at',
        'updated_at',
    ];

    // Relationships
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
