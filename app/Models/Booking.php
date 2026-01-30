<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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

    protected $casts = [
        'check_in'  => 'date',
        'check_out' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /* ======================
       RELATIONSHIPS
       ====================== */

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /* ======================
       BUSINESS LOGIC
       ====================== */

    public function nights(): int
    {
        return $this->check_in->diffInDays($this->check_out);
    }

    public function isActive(): bool
    {
        return in_array($this->booking_status, [
            'confirmed',
            'checked_in',
        ]);
    }

    public function isCancelled(): bool
    {
        return $this->booking_status === 'cancelled';
    }

    public function isCompleted(): bool
    {
        return $this->booking_status === 'checked_out';
    }
}
