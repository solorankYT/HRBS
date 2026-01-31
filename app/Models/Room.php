<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'room_number',
        'type',
        'description',
        'capacity',
        'amenities',
        'price',
        'status',
        'image_urls',
    ];

    protected $casts = [
        'amenities' => 'array',
        'image_urls' => 'array',
    ];

 public function bookingRooms()
{
    return $this->hasMany(BookingRoom::class);
}

}
