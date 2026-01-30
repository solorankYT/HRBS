<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            // BASIC STUDIO ROOM
            [
                'room_number' => '101',
                'type' => 'Basic Studio Room',
                'description' => 'Cozy studio room ideal for solo travelers or couples.',
                'capacity' => 2,
                'amenities' => ['WiFi', 'Air Conditioning', 'TV'],
                'price' => 2000,
                'status' => 'available',
                'image_urls' => ['rooms/basic1.jpg'],
            ],
            [
                'room_number' => '102',
                'type' => 'Basic Studio Room',
                'description' => 'Affordable studio room with essential amenities.',
                'capacity' => 2,
                'amenities' => ['WiFi', 'Air Conditioning'],
                'price' => 2000,
                'status' => 'available',
                'image_urls' => ['rooms/basic2.jpg'],
            ],

            // STANDARD ROOM
            [
                'room_number' => '201',
                'type' => 'Standard Room',
                'description' => 'Comfortable standard room with modern interior.',
                'capacity' => 2,
                'amenities' => ['WiFi', 'TV', 'Air Conditioning'],
                'price' => 3000,
                'status' => 'available',
                'image_urls' => ['rooms/standard1.jpg'],
            ],

            // FAMILY ROOM
            [
                'room_number' => '301',
                'type' => 'Family Room',
                'description' => 'Spacious room suitable for families and groups.',
                'capacity' => 4,
                'amenities' => ['WiFi', 'TV', 'Mini Bar', 'Extra Bed'],
                'price' => 4500,
                'status' => 'available',
                'image_urls' => ['rooms/family1.jpg'],
            ],

            // PREMIUM ROOM
            [
                'room_number' => '401',
                'type' => 'Premium Room',
                'description' => 'Luxury room with premium amenities and elegant design.',
                'capacity' => 2,
                'amenities' => ['WiFi', 'TV', 'Bathtub', 'Mini Bar'],
                'price' => 6000,
                'status' => 'maintenance',
                'image_urls' => ['rooms/premium1.jpg'],
            ],
        ];

        foreach ($rooms as $room) {
            Room::create([
                'room_number' => $room['room_number'],
                'type' => $room['type'],
                'description' => $room['description'],
                'capacity' => $room['capacity'],
                'amenities' => json_encode($room['amenities']),
                'price' => $room['price'],
                'status' => $room['status'],
                'image_urls' => json_encode($room['image_urls']),
            ]);
        }
    }
}
