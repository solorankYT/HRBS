<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Feedback;
use Illuminate\Validation\ValidationException;

class UserFeedbackService
{
    /**
     * Create feedback for a booking
     */
    public function createFeedback(Booking $booking, array $data): Feedback
    {
        if ($booking->booking_status !== 'checked_out') {
            throw ValidationException::withMessages([
                'booking' => 'Feedback can only be submitted after check-out.'
            ]);
        }

        if ($booking->feedback) {
            throw ValidationException::withMessages([
                'feedback' => 'Feedback has already been submitted for this booking.'
            ]);
        }

        if (!empty($data['room_id'])) {
            $roomBelongsToBooking = $booking->rooms()
                ->where('room_id', $data['room_id'])
                ->exists();

            if (!$roomBelongsToBooking) {
                throw ValidationException::withMessages([
                    'room_id' => 'The selected room is not part of this booking.'
                ]);
            }
        }

        return $booking->feedback()->create([
            'room_id' => $data['room_id'] ?? null,
            'rating' => $data['rating'],
            'comments' => $data['comments'] ?? null,
        ]);
    }
}