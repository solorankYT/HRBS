<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use SoftDeletes;
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

        public function getImageUrlAttribute()
    {
        if (!$this->image_urls || count($this->image_urls) === 0) {
            return null;
        }

        return asset('storage/' . $this->image_urls[0]);
    }
    
 public function bookingRooms()
{
    return $this->hasMany(BookingRoom::class);
}

}
