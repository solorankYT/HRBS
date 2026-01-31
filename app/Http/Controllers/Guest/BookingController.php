<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingRoom;
use App\Models\BookingGuest;
use App\Models\Room;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
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
            'rooms.*.guest.special_requests' => 'nullable|string|max:1000',
        ]);

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);
        $nights = $checkIn->diffInDays($checkOut);

        $booking = Booking::create([
            'reference_number' => strtoupper(Str::random(8)),
            'check_in' => $request->check_in,
            'check_out' => $request->check_out,
            'number_of_guests' => $request->number_of_guests,
            'special_requests' => null,
            'booking_status' => 'pending',
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

        return response()->json($booking->load('rooms.room', 'guests'), 201);
    }


        public function show(Request $request, $reference)
        {
            $request->validate([
                'email' => 'nullable|email',
                'phone' => 'nullable|string'
            ]);

            if (!$request->email && !$request->phone) {
                return response()->json([
                    'message' => 'Email or phone is required'
                ], 422);
            }

            $booking = Booking::with(['rooms.room'])
                ->where('reference_number', $reference)
                ->first();

            if (!$booking) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            $guestMatch = $booking->guests->filter(function ($guest) use ($request) {
                return ($request->email && $guest->email === $request->email) ||
                       ($request->phone && $guest->phone === $request->phone);
            });

            if ($guestMatch->isEmpty()) {
                return response()->json(['message' => 'Guest not found for this booking'], 404);
            }

            return response()->json([
                'reference' => $booking->reference_number,
                'status' => $booking->booking_status,
                'check_in' => $booking->check_in,
                'check_out' => $booking->check_out,
                'guests' => $booking->number_of_guests,
                'total' => $booking->total_amount,
                'rooms' => $booking->rooms->map(function ($br) {
                    return [
                        'room_number' => $br->room->room_number,
                        'type' => $br->room->type,
                        'price' => $br->room->price,
                        'guest_name' => $br->guest_name,
                        'guest_email' => $br->guest_email,
                        'payment_method' => $br->payment_method,
                    ];
                })
            ]);
        }


    public function cancel($reference)
{
    $booking = Booking::where('reference_number', $reference)->firstOrFail();

    if ($booking->booking_status === 'cancelled') {
        return response()->json(['message' => 'Already cancelled'], 400);
    }

    $booking->update(['booking_status' => 'cancelled']);

    return response()->json(['message' => 'Booking cancelled']);
}

}
