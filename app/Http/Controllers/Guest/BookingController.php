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

  public function bookingSuccess($reference)
{
    $booking = Booking::with(['rooms.room', 'guests', 'payments'])
        ->where('reference_number', $reference)
        ->first();

    if (!$booking) {
        return response()->json(['message' => 'Booking not found'], 404);
    }

    return response()->json([
        'reference' => $booking->reference_number,
        'status' => $booking->booking_status,
        'check_in' => $booking->check_in,
        'check_out' => $booking->check_out,
        'guests' => $booking->number_of_guests,
        'created_at' => $booking->created_at->format('Y-m-d'),
        'guest' => $booking->guests->first() ? [
            'name' => $booking->guests->first()->name,
            'email' => $booking->guests->first()->email,
        ] : null,
        'items' => $booking->rooms->map(function ($room) {
            return [
                'room' => $room->room->room_name ?? 'N/A',
                'nights' => $room->nights,
                'price' => $room->price_per_night,
                'subtotal' => $room->subtotal,
            ];
        }),
        'total' => $booking->total_amount,
        'paid' => $booking->payments->sum('amount'),
        'vat' => round($booking->total_amount * 0.12, 2),
        'balance' => $booking->total_amount - $booking->payments->sum('amount'),
    ]);
}



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
                return response()->json(['message' => 'Email or phone is required'], 422);
            }

            $booking = Booking::with(['rooms.room', 'guests'])
                ->where('reference_number', $reference)
                ->first();

            if (!$booking) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            $guestMatch = $booking->guests->filter(function ($guest) use ($request) {
                return ($request->email && $guest->email === $request->email)
                    || ($request->phone && $guest->phone === $request->phone);
            });

            if ($guestMatch->isEmpty()) {
                return response()->json(['message' => 'Guest not found for this booking'], 404);
            }

            $primaryGuest = $guestMatch->first();

            return response()->json([
                'reference' => $booking->reference_number,
                'status' => $booking->booking_status,
                'check_in' => $booking->check_in,
                'check_out' => $booking->check_out,
                'guests_count' => $booking->number_of_guests,
                'total' => $booking->total_amount,
                'payment_status' => $booking->payment_status ?? 'pending',

                'primary_guest' => [
                    'name' => $primaryGuest->name,
                    'email' => $primaryGuest->email,
                ],

                'rooms' => $booking->rooms->map(function ($br) {
                    return [
                        'room_number' => $br->room->room_number,
                        'type' => $br->room->type,
                        'price_per_night' => $br->price_per_night,
                        'nights' => $br->nights,
                        'subtotal' => $br->subtotal,
                        'payment_method' => $br->payment_method,
                    ];
                }),
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

    public function submitPaymentProof(Request $request, $reference)
    {
        $request->validate([
            'payment_method' => 'required|string|in:bank_transfer,gcash,paypal,credit_card,other',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
            'transaction_id' => 'nullable|string|max:100',
        ]);

        $booking = Booking::where('reference_number', $reference)->first();

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        // Store the image
        $path = $request->file('proof_image')->store('payment-proofs', 'public');

        // Create payment record (status: pending for admin verification)
        $payment = $booking->payments()->create([
            'amount' => $booking->total_amount,
            'method' => $request->payment_method,
            'reference' => $request->transaction_id,
            'status' => 'pending',
            'proof_image' => $path,
            'paid_at' => now(),
        ]);
        // mark booking as submitted
        $booking->update(['payment_status' => 'submitted']);

        return response()->json([
            'message' => 'Payment proof submitted successfully. Waiting for verification.',
            'payment_id' => $payment->id,
        ], 201);
    }

}
