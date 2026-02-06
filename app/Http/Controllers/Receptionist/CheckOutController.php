<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;

class CheckOutController extends Controller
{
    public function complete(Request $request, $reference)
    {
        try {
            $booking = Booking::where('reference_number', $reference)->first();
            if (!$booking) {
                return response()->json(['message' => 'Booking not found'], 404);
            }

            $booking->booking_status = 'checked_out';
            $booking->save();

            return response()->json(['message' => 'Checked out successfully', 'booking' => $booking]);
        } catch (\Exception $e) {
            \Log::error('Receptionist\CheckOutController::complete error: ' . $e->getMessage());
            return response()->json(['message' => 'Server error'], 500);
        }
    }

        public function show(Request $request, $reference)
                {
                    $booking = Booking::with(['rooms.room', 'guests', 'payments'])
                        ->where('reference_number', $reference)
                        ->first();

                    if (!$booking) {
                        return response()->json(['message' => 'Booking not found'], 404);
                    }

                    // If email or phone provided, filter to that guest
                    if ($request->email || $request->phone) {
                        $guestMatch = $booking->guests->filter(function ($guest) use ($request) {
                            return ($request->email && $guest->email === $request->email)
                                || ($request->phone && $guest->phone === $request->phone);
                        });

                        if ($guestMatch->isEmpty()) {
                            return response()->json(['message' => 'Guest not found for this booking'], 404);
                        }

                        $primaryGuest = $guestMatch->first();
                    } else {
                        // No verification provided, use first guest
                        $primaryGuest = $booking->guests->first();
                    }

                    return response()->json([
                        'reference_number' => $booking->reference_number,
                        'booking_status' => $booking->booking_status,
                        'payment_status' => $booking->payment_status ?? 'pending',
                        'check_in' => $booking->check_in,
                        'check_out' => $booking->check_out,
                        'number_of_guests' => $booking->number_of_guests,
                        'total_amount' => $booking->total_amount,
                        'guest_name' => $primaryGuest->name ?? 'N/A',
                        'guest' => $primaryGuest ? [
                            'name' => $primaryGuest->name,
                            'email' => $primaryGuest->email,
                            'phone' => $primaryGuest->phone,
                            'contact_number' => $primaryGuest->phone,
                            'address' => $primaryGuest->address ?? '',
                        ] : null,
                        'adults' => $booking->number_of_guests,
                        'kids' => 0,
                        'rooms' => $booking->rooms->map(function ($br) {
                            return [
                                'room_number' => $br->room->room_number ?? '',
                                'type' => $br->room->type ?? '',
                                'price_per_night' => $br->price_per_night,
                                'nights' => $br->nights,
                                'days' => $br->nights,
                                'subtotal' => $br->subtotal,
                            ];
                        }),
                    ]);
                }

        }
