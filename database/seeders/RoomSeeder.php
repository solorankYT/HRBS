<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_number' => '101',
                'type' => 'Single',
                'description' => 'Cozy single room with queen bed.',
                'capacity' => 1,
                'amenities' => ['wifi', 'ac', 'tv'],
                'price' => 50.00,
                'status' => 'available',
                'floor_number' => 1,
                'image_urls' => [
                    'https://example.com/images/room101-1.jpg',
                    'https://example.com/images/room101-2.jpg'
                ],
            ],
            [
                'room_number' => '102',
                'type' => 'Double',
                'description' => 'Spacious double room for two guests.',
                'capacity' => 2,
                'amenities' => ['wifi', 'ac', 'tv', 'mini-fridge'],
                'price' => 80.00,
                'status' => 'available',
                'floor_number' => 1,
                'image_urls' => [
                    'https://example.com/images/room102-1.jpg',
                    'https://example.com/images/room102-2.jpg'
                ],
            ],
            [
                'room_number' => '201',
                'type' => 'Suite',
                'description' => 'Luxury suite with living area and sea view.',
                'capacity' => 4,
                'amenities' => ['wifi', 'ac', 'tv', 'mini-fridge', 'balcony'],
                'price' => 200.00,
                'status' => 'available',
                'floor_number' => 2,
                'image_urls' => [
                    'https://example.com/images/room201-1.jpg',
                    'https://example.com/images/room201-2.jpg'
                ],
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
