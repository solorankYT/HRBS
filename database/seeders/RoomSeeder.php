<?php

namespace Database\Seeders;
use App\Models\Room;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['room_number' => '101', 'type' => 'Standard', 'price' => 1500],
            ['room_number' => '102', 'type' => 'Standard', 'price' => 1500],
            ['room_number' => '201', 'type' => 'Deluxe', 'price' => 2500],
            ['room_number' => '202', 'type' => 'Deluxe', 'price' => 2500],
            ['room_number' => '301', 'type' => 'Suite', 'price' => 4000],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }
    }
}