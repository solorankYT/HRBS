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
    $bookings = Booking::with(['guests', 'rooms.room'])
        ->orderBy('created_at', 'desc')
        ->paginate(6); 

    $data = $bookings->getCollection()->map(function ($booking) {
        return [
            'id' => $booking->id,
            'reference_number' => $booking->reference_number,
            'guest_name' => optional($booking->guests->first())->name ?? 'N/A',
            'rooms' => $booking->rooms
                ->map(fn ($br) => $br->room->room_number ?? 'Unknown')
                ->implode(', '),
            'check_in' => $booking->check_in,
            'check_out' => $booking->check_out,
            'status' => $booking->booking_status,
            'amount' => $booking->total_amount,
        ];
    });

    return response()->json([
        'data' => $data,
        'current_page' => $bookings->currentPage(),
        'last_page' => $bookings->lastPage(),
        'per_page' => $bookings->perPage(),
        'total' => $bookings->total(),
    ]);
}




    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
public function show($id)
{
    $booking = Booking::with([
        'guests',
        'rooms.room',
        'payments'
    ])->findOrFail($id);

    return response()->json([
        'id' => $booking->id,
        'reference_number' => $booking->reference_number,
        'status' => $booking->booking_status,
        'check_in' => $booking->check_in,
        'check_out' => $booking->check_out,
        'date_booked' => $booking->created_at->toDateString(),
        'total_amount' => $booking->total_amount,

        'guest' => [
            'name' => optional($booking->guests->first())->name,
            'email' => optional($booking->guests->first())->email,
            'phone' => optional($booking->guests->first())->phone,
            'special_requests' => optional($booking->guests->first())->special_requests,
        ],

        'rooms' => $booking->rooms->map(function ($br) {
            return [
                'room_number' => $br->room->room_number ?? 'N/A',
                'room_type' => $br->room->room_type ?? 'N/A',
                'price_per_night' => $br->price_per_night,
                'nights' => $br->nights,
                'subtotal' => $br->subtotal,
            ];
        }),

        'payment' => $booking->payments->first(),
    ]);
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
