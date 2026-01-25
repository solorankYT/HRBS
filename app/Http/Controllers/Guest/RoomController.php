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
        $rooms = Room::findOrFail($id);

        return response()->json($rooms);
    }

    public function availability(Request $request)
{
    $request->validate([
        'check_in' => 'required|date',
        'check_out' => 'required|date|after:check_in',
    ]);

    $rooms = Room::where('status', 'available')
        ->whereDoesntHave('bookings', function ($query) use ($request) {
            $query->whereIn('booking_status', ['confirmed', 'checked_in'])
                  ->where('check_in', '<', $request->check_out)
                  ->where('check_out', '>', $request->check_in);
        })
        ->get();

    return response()->json($rooms);
}


    

}