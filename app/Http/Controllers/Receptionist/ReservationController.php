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
    $bookings = Booking::with(['guests', 'rooms.room', 'payments'])
        ->orderBy('created_at', 'desc')
        ->paginate(6);

    $data = $bookings->getCollection()->map(function ($booking) {

        $latestPayment = $booking->payments->sortByDesc('created_at')->first();

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
            'payment_status' => $latestPayment->status ?? 'pending',
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
        'number_of_guests' =>$booking->number_of_guests,

        'guest' => [
            'name' => optional($booking->guests->first())->name,
            'email' => optional($booking->guests->first())->email,
            'phone' => optional($booking->guests->first())->phone,
            'special_requests' => optional($booking->guests->first())->special_requests,
        ],



        'rooms' => $booking->rooms->map(function ($br) {
            return [
                'room_number' => $br->room->room_number ?? 'N/A',
                'room_type' => $br->room->type ?? 'N/A',
                'price_per_night' => $br->price_per_night,
                'nights' => $br->nights,
                'subtotal' => $br->subtotal,
            ];
        }),

        'payment' => $booking->payments->first(),
    ]);
}


public function lookupByReference(Request $request)
{
    $request->validate([
        'reference' => 'required|string|size:10'
    ]);

    $booking = Booking::where('reference_number', $request->reference)->first();

    if (!$booking) {
        return response()->json(['message' => 'Reservation not found'], 404);
    }

    return response()->json([
        'booking_id' => $booking->id,
        'status' => $booking->status,
    ]);
}

public function checkIn(string $id)
{
    $booking = Booking::findOrFail($id);

    if ($booking->booking_status !== 'confirmed') {
        return response()->json([
            'message' => 'Booking must be confirmed before check-in'
        ], 422);
    }

    $booking->booking_status = 'checked_in';
    $booking->save();

    return response()->json([
        'message' => 'Check-in successful',
        'status'  => $booking->booking_status
    ]);
}


 public function checkOut(string $id){
        $booking = Booking::findorFail($id);

        $booking->status = $booking->booking_status === 'confirmed' 
        ? 'checked_out'
        : 'pending';

         $booking->save();

        return response()->json([
            'message' => 'booking status updated',
            'status'  => $booking->booking_status
        ]);
 }

}
