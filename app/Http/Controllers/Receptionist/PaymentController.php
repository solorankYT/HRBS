<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with(['booking.guests'])->orderBy('created_at', 'desc')->get();

        $data = $payments->map(function ($p) {
            return [
                'id' => $p->id,
                'booking_id' => $p->booking_id,
                'reference' => optional($p->booking)->reference_number,
                'guest_name' => optional(optional($p->booking)->guests->first())->name,
                'method' => $p->method,
                'amount' => $p->amount,
                'status' => $p->status,
                'proof_image' => $p->proof_image,
                'created_at' => $p->created_at->toDateTimeString(),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function show($id)
    {
        $payment = Payment::with(['booking.rooms.room', 'booking.guests'])->findOrFail($id);

        return response()->json([
            'id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'reference' => optional($payment->booking)->reference_number,
            'guest' => optional(optional($payment->booking)->guests->first()),
            'method' => $payment->method,
            'amount' => $payment->amount,
            'status' => $payment->status,
            'proof_image' => $payment->proof_image,
            'created_at' => $payment->created_at->toDateTimeString(),
            'booking' => [
                'total' => optional($payment->booking)->total_amount,
                'rooms' => optional($payment->booking)->rooms->map(function ($br) {
                    return [
                        'room_number' => $br->room->room_number ?? null,
                        'type' => $br->room->type ?? null,
                        'nights' => $br->nights,
                        'subtotal' => $br->subtotal,
                    ];
                }),
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'status' => 'required|in:pending,paid,failed,verified'
            ]);

            $payment = Payment::findOrFail($id);
            $payment->status = $request->status;
            $payment->save();

            // update booking payment_status mapping
            $booking = Booking::find($payment->booking_id);
            if ($booking) {
                $map = [
                    'verified' => 'verified',
                    'paid' => 'verified',
                    'failed' => 'failed',
                    'pending' => 'pending',
                ];
                $booking->payment_status = $map[$request->status] ?? 'pending';
                $booking->booking_status = $booking->payment_status === 'verified' ? 'confirmed' : $booking->booking_status;
                $booking->save();
            }

            return response()->json(['message' => 'Payment status updated']);
        } catch (\Exception $e) {
            // log error and return message for debugging
            logger()->error('PaymentController@updateStatus error: ' . $e->getMessage(), [
                'id' => $id,
                'payload' => $request->all()
            ]);
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }
}
