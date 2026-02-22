<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomManagementController extends Controller
{
    public function index(): JsonResponse
    {
    $rooms = Room::all();
    return response()->json($rooms);
    }

    public function show(string $id): JsonResponse
    {
        $rooms = Room::findOrFail($id);

        return response()->json($rooms);
    }

    public function create(Request $request): JsonResponse
    {

   
        $validated = $request->validate([
            'room_number' => 'required|string|max:50|unique:rooms,room_number',
            'type'        => 'required|string|max:255',
            'image_urls'   => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'capacity'    => 'required|integer|min:1',
            'price'       => 'required|numeric|min:0',
            'amenities'   => 'array',
            'amenities.*' => 'string',
            'status'      => 'required|in:available,maintenance,cleaning,occupied',
        ]);
        
        $path = $request->file('image_urls')->store('rooms', 'public');

        $validated['image_urls'] = [$path];
        $room = Room::create($validated);

        return response()->json([
            'message' => 'Room created successfully',
            'data'    => $room
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
            'status'      => 'sometimes|required|in:available,maintenance,cleaning,occupied',
            'image_urls' => 'sometimes|file|image|mimes:jpeg,png,jpg,gif,webp|max:5120',

        ]);

        if ($request->hasFile('image_urls')) {
            $newPath = $request->file('image_urls')->store('rooms', 'public');

            $oldImages = $room->image_urls;
            if ($oldImages) {

                $oldList = is_array($oldImages) ? $oldImages : [$oldImages];
                foreach ($oldList as $old) {
                    if ($old && Storage::disk('public')->exists($old)) {
                        Storage::disk('public')->delete($old);
                    }
                }
            }

            $validated['image_urls'] = [$newPath];
        }

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

    public function destroy(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);
        
        if ($room->image_urls) {
            $oldList = is_array($room->image_urls) ? $room->image_urls : [$room->image_urls];
            foreach ($oldList as $old) {
                if ($old && Storage::disk('public')->exists($old)) {
                    Storage::disk('public')->delete($old);
                }
            }
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully'
        ]);
    }


}