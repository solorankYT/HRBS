<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        Room::create([
            'room_number' => '101',
            'type' => 'Deluxe',
            'description' => 'Deluxe room with balcony',
            'capacity' => 2,
            'amenities' => ['WiFi', 'Aircon', 'TV'],
            'price' => 2500,
            'status' => 'available',
            'image_urls' => [
                'room101_1.jpg',
                'room101_2.jpg'
            ],
        ]);

        Room::create([
            'room_number' => '102',
            'type' => 'Standard',
            'description' => 'Standard room',
            'capacity' => 2,
            'amenities' => ['WiFi', 'TV'],
            'price' => 1800,
            'status' => 'available',
        ]);

        Room::create([
            'room_number' => '201',
            'type' => 'Family',
            'description' => 'Family room good for 4',
            'capacity' => 4,
            'amenities' => ['WiFi', 'Aircon', 'TV', 'Mini Bar'],
            'price' => 3500,
            'status' => 'available',
        ]);
    }
}
