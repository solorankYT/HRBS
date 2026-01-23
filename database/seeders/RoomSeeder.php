<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'room_number' => '101',
                'type' => 'Standard',
                'capacity' => 2,
                'amenities' => json_encode(['Wifi', 'Tv', 'Ac']),
                'price' => 1500,
                'status' => 'available',
            ],
            [
                'room_number' => '102',
                'type' => 'Standard',
                'capacity' => 2,
                'amenities' => json_encode(['Wifi', 'Tv', 'Ac']),
                'price' => 1500,
                'status' => 'available',
            ],
            [
                'room_number' => '201',
                'type' => 'Deluxe',
                'capacity' => 4,
                'amenities' => json_encode(['Wifi', 'Tv', 'Ac', 'Mini Bar']),
                'price' => 2500,
                'status' => 'available',
            ],
            [
                'room_number' => '202',
                'type' => 'Deluxe',
                'capacity' => 4,
                'amenities' => json_encode(['Wifi', 'Tv', 'Ac', 'Mini Bar']),
                'price' => 2500,
                'status' => 'maintenance',
            ],
            [
                'room_number' => '301',
                'type' => 'Suite',
                'capacity' => 6,
                'amenities' => json_encode(['Wifi', 'Tv', 'Ac', 'Mini Bar', 'Jacuzzi']),
                'price' => 4000,
                'status' => 'available',
            ],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}
