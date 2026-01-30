<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

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
        'amenities'  => 'array',
        'image_urls' => 'array',
        'price'      => 'decimal:2',
    ];

    /* ======================
       SIMPLE HELPERS
       ====================== */

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    public function isUnderMaintenance(): bool
    {
        return $this->status === 'maintenance';
    }
}
