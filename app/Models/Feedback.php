<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    protected $fillable = [
        'booking_id',
        'rating',
        'comments'
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
