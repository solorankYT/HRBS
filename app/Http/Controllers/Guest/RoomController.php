<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return Room::where('status', 'available')->get();
    }

    public function show(string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        return response()->json($room);
    }

   public function availability(Request $request)
{
    $request->validate([
        'check_in' => 'required|date',
        'check_out' => 'required|date|after:check_in',
        'number_of_guests' => 'required|integer|min:1',
    ]);

    $availableRooms = Room::query()
        ->where('status', 'available')
        ->where('capacity', '>=', $request->number_of_guests)
        ->whereDoesntHave('bookingRooms.booking', function ($query) use ($request) {
            $query->whereIn('booking_status', [
                    'pending',
                    'confirmed',
                    'checked_in',
                ])
                ->where('check_in', '<', $request->check_out)
                ->where('check_out', '>', $request->check_in);
        })
        ->get();

    $rooms = $availableRooms
        ->groupBy('type')
        ->map(function ($group) {
            return [
                'id' => $group->first()->id,
                'type' => $group->first()->type,
                'image_urls' => $group->first()->image_urls,
                'capacity' => $group->first()->capacity,
                'price' => $group->first()->price,
                'available_count' => $group->count(),
            ];
        })
        ->values();

    return response()->json($rooms);
}


}
