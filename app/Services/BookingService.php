<?php 

namespace App\Services;

use App\Models\Booking;
use Exception;

class BookingService
{
    public function cancel(Booking $booking, ?string $reason = null): void
    {
        if ($booking->booking_status === 'cancelled') {
            throw new Exception('Booking is already cancelled');
        }

        if (in_array($booking->booking_status, ['checked_in', 'checked_out'])) {
            throw new Exception('Cannot cancel after check-in');
        }

        if (now()->diffInHours($booking->check_in, false) < 24) {
            throw new Exception('Cancellation is only allowed 24 hours before check-in');
        }

        $booking->update([
            'booking_status' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_by' => 'guest',
            'cancellation_reason' => $reason,
        ]);
    }
}
