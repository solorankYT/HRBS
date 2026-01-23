<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomManagementController extends Controller
{
    public function index(): JsonResponse
    {
    $rooms = Room::all();
    return response()->json($rooms);
    }


    public function create(Request $request)
    {
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number',
            'type'        => 'required|string|max:255',
            'capacity'    => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'amenities'   => 'required|array',
            'amenities.*' => 'string',
            'status'      => 'required|in:available,maintenance',
        ]);

        Room::create($validated);

        return response()->json([
            'message' => 'Room created successfully'
        ], 201);
    }


    public function update(Request $request, string $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => 'sometimes|required|string|max:50|unique:rooms,room_number,' . $room->id,
            'type'        => 'sometimes|required|string|max:255',
            'capacity'    => 'sometimes|required|integer|min:1',
            'price'       => 'sometimes|required|numeric|min:0',
            'amenities'   => 'sometimes|required|array',
            'amenities.*' => 'string',
            'status'      => 'sometimes|required|in:available,maintenance',
        ]);

        $room->update($validated);

        return response()->json([
            'message' => 'Room updated successfully',
            'room'    => $room
        ]);
    }


    public function setStatus(string $id)
    {
        $room = Room::findOrFail($id);

        $room->status = $room->status === 'available'
            ? 'maintenance'
            : 'available';

        $room->save();

        return response()->json([
            'message' => 'Room status updated',
            'status'  => $room->status
        ]);
    }


}