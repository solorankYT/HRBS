<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingGuest;
use App\Models\BookingRoom;
use App\Models\Room;
use App\Models\Payment;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

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




    /*
     * Create a walk-in booking (receptionist).
     */
    public function storeWalkin(Request $request): JsonResponse
    {
        $request->validate([
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'number_of_guests' => 'required|integer|min:1',
            'rooms' => 'required|array|min:1',
            'rooms.*.id' => 'required|exists:rooms,id',
            'rooms.*.guest.name' => 'required|string|max:255',
            'rooms.*.guest.email' => 'required|email|max:255',
            'rooms.*.guest.phone' => 'required|string|max:20',
            'payment_method' => 'required|string',
            'payment_amount' => 'required|numeric|min:0',
        ]);

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $nights = $checkIn->diffInDays($checkOut);

        $booking = Booking::create([
            'reference_number' => strtoupper(Str::random(10)),
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'number_of_guests' => $request->number_of_guests,
            'special_requests' => $request->special_requests ?? null,
            'booking_status' => 'confirmed',
            'total_amount' => 0,
        ]);

        $totalAmount = 0;

        foreach ($request->rooms as $roomData) {
            $room = Room::findOrFail($roomData['id']);

            $subtotal = $room->price * $nights;
            $totalAmount += $subtotal;

            BookingRoom::create([
                'booking_id' => $booking->id,
                'room_id' => $room->id,
                'price_per_night' => $room->price,
                'nights' => $nights,
                'subtotal' => $subtotal,
            ]);

            $guestData = $roomData['guest'];
            BookingGuest::create([
                'booking_id' => $booking->id,
                'name' => $guestData['name'],
                'email' => $guestData['email'],
                'phone' => $guestData['phone'],
                'special_requests' => $guestData['special_requests'] ?? null,
            ]);
        }

        $booking->update(['total_amount' => $totalAmount]);

        // create immediate payment record
        $payment = Payment::create([
            'booking_id' => $booking->id,
            'amount' => $request->payment_amount,
            'reference' => strtoupper(Str::random(8)),
            'method' => $request->payment_method,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $booking->update(['payment_status' => 'paid']);

        return response()->json($booking->load('rooms.room', 'guests', 'payments'), 201);
    }

}