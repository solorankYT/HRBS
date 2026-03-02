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

        return $booking->feedback()->create([
            'rating' => $data['rating'],
            'comments' => $data['comments'] ?? null,
        ]);
    }
}