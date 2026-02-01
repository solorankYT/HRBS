<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingGuest;
use App\Models\BookingRoom;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
      public function index()
    {
        $bookings = Booking::with([
            'guests',
            'rooms.room'
        ])
        ->orderBy('created_at', 'desc')
        ->get();

        $data = $bookings->map(function ($booking) {
            return [
                'id' => $booking->id,
                'reference_number' => $booking->reference_number,

                // First guest only (main guest)
                'guest_name' => optional($booking->guests->first())->name ?? 'N/A',

                // Multiple rooms → comma separated
                'rooms' => $booking->rooms
                    ->map(fn ($br) => $br->room->room_number ?? 'Unknown')
                    ->implode(', '),

                'check_in' => $booking->check_in,
                'check_out' => $booking->check_out,

                'status' => $booking->booking_status,
                'amount' => $booking->total_amount ?? 0,
            ];
        });

        return response()->json($data);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Booking $booking)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        //
    }
}
