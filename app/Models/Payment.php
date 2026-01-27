<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'amount',
        'reference',
        'method',
        'status',
        'paid_at',
    ];

    protected $dates = [
        'paid_at',
        'created_at',
        'updated_at',
    ];

    // Relationships
    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
