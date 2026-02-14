<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Room;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ReportsController extends Controller
{
    /**
     * Get revenue metrics and breakdown data
     */
    public function revenueReport(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        
        // Previous month for comparison
        $prevStart = $startOfMonth->copy()->subMonth();
        $prevEnd = $prevStart->copy()->endOfMonth();

        // Total Revenue (current month)
        $currentRevenue = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') ?? 0;

        // Previous month revenue for comparison
        $previousRevenue = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$prevStart, $prevEnd])
            ->sum('amount') ?? 0;

        $revenueChangePercent = $previousRevenue > 0 
            ? (($currentRevenue - $previousRevenue) / $previousRevenue * 100)
            : 0;

        // Average Daily Rate (average booking amount)
        $avgDailyRate = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->avg('total_amount') ?? 0;

        $prevAvgRate = Booking::whereBetween('created_at', [$prevStart, $prevEnd])
            ->avg('total_amount') ?? 0;

        $avgRateChangePercent = $prevAvgRate > 0 
            ? (($avgDailyRate - $prevAvgRate) / $prevAvgRate * 100)
            : 0;

        // RevPAR (Revenue per Available Room) - simplified as total revenue / number of unique rooms booked
        $uniqueRooms = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->with('rooms')
            ->get()
            ->pluck('rooms')
            ->flatten()
            ->count();

        $revpar = $uniqueRooms > 0 ? ($currentRevenue / $uniqueRooms) : 0;

        $prevUniqueRooms = Booking::whereBetween('created_at', [$prevStart, $prevEnd])
            ->with('rooms')
            ->get()
            ->pluck('rooms')
            ->flatten()
            ->count();

        $prevRevpar = $prevUniqueRooms > 0 ? ($previousRevenue / $prevUniqueRooms) : 0;
        $revparChangePercent = $prevRevpar > 0 ? (($revpar - $prevRevpar) / $prevRevpar * 100) : 0;

        return response()->json([
            'period' => now()->format('F Y'),
            'metrics' => [
                'total_revenue' => [
                    'value' => $currentRevenue,
                    'label' => 'Total Revenue',
                    'change' => round($revenueChangePercent, 1),
                    'currency' => '₱'
                ],
                'avg_daily_rate' => [
                    'value' => round($avgDailyRate, 2),
                    'label' => 'Average Daily Rate',
                    'change' => round($avgRateChangePercent, 1),
                    'currency' => '₱'
                ],
                'revpar' => [
                    'value' => round($revpar, 2),
                    'label' => 'RevPAR',
                    'change' => round($revparChangePercent, 1),
                    'currency' => '₱'
                ]
            ]
        ]);
    }

    /**
     * Get revenue breakdown by source
     */
    public function revenueBreakdown(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $totalRevenue = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') ?? 1; // Avoid division by zero

        // Breakdown by payment method
        $breakdown = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->groupBy('method')
            ->selectRaw('method, SUM(amount) as total')
            ->get()
            ->map(function ($item) use ($totalRevenue) {
                return [
                    'label' => ucfirst(str_replace('_', ' ', $item->method ?? 'Unknown')),
                    'value' => round($item->total, 2),
                    'percentage' => round(($item->total / $totalRevenue) * 100, 1)
                ];
            });

        // If no data, provide default breakdown
        if ($breakdown->isEmpty()) {
            $breakdown = collect([
                ['label' => 'Room Revenue', 'value' => $totalRevenue * 0.85, 'percentage' => 85],
                ['label' => 'Food & Beverage', 'value' => $totalRevenue * 0.10, 'percentage' => 10],
                ['label' => 'Other Services', 'value' => $totalRevenue * 0.05, 'percentage' => 5]
            ]);
        }

        return response()->json([
            'period' => now()->format('F Y'),
            'total' => $totalRevenue,
            'breakdown' => $breakdown
        ]);
    }

    /**
     * Get daily revenue trend for the current month
     */
    public function dailyTrend(): JsonResponse
    {
        $days = 14; // Last 14 days
        $trends = [];
        $maxRevenue = 0;

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $startOfDay = $date->copy()->startOfDay();
            $endOfDay = $date->copy()->endOfDay();

            $revenue = Payment::where('status', 'completed')
                ->whereBetween('paid_at', [$startOfDay, $endOfDay])
                ->sum('amount') ?? 0;

            $trends[] = [
                'date' => $date->format('M d'),
                'formatted_date' => $date->format('F j'),
                'value' => round($revenue, 2)
            ];

            $maxRevenue = max($maxRevenue, $revenue);
        }

        // Add percentage calculations for bar widths
        $trends = collect($trends)->map(function ($trend) use ($maxRevenue) {
            $trend['percentage'] = $maxRevenue > 0 ? ($trend['value'] / $maxRevenue) * 100 : 0;
            return $trend;
        })->all();

        return response()->json([
            'period' => 'Last 14 Days',
            'max_value' => $maxRevenue,
            'trends' => $trends
        ]);
    }

    /**
     * Get comprehensive dashboard report
     */
    public function dashboard(): JsonResponse
    {
        $revenueReport = json_decode($this->revenueReport()->getContent(), true);
        $breakdown = json_decode($this->revenueBreakdown()->getContent(), true);
        $trends = json_decode($this->dailyTrend()->getContent(), true);
        $occupancyPayload = json_decode($this->occupancyReport()->getContent(), true);
        // occupancyReport returns ['occupancy' => [...] ] — unwrap so dashboard returns occupancy directly
        $occupancy = $occupancyPayload['occupancy'] ?? $occupancyPayload;
        $reservations = json_decode($this->reservationReport()->getContent(), true);
        $feedback = json_decode($this->feedbackReport()->getContent(), true);

        return response()->json([
            'revenue' => $revenueReport,
            'breakdown' => $breakdown,
            'trends' => $trends,
            'occupancy' => $occupancy,
            'reservations' => $reservations,
            'feedback' => $feedback
        ]);
    }

    /**
     * Get occupancy report - room utilization and occupancy rates
     */
    public function occupancyReport(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $totalRooms = Room::count();
        
        // Total room nights available in the month
        // Use Carbon's daysInMonth to avoid any edge cases from multiple now() calls
        $daysInMonth = (int) $startOfMonth->daysInMonth;
        $totalRoomNights = max(0, $totalRooms * $daysInMonth);

        // Booked room nights
        $bookedNights = Booking::where('booking_status', '!=', 'cancelled')
        ->where(function ($query) use ($startOfMonth, $endOfMonth) {
            $query->whereBetween('check_in', [$startOfMonth, $endOfMonth])
                ->orWhereBetween('check_out', [$startOfMonth, $endOfMonth])
                ->orWhere(function ($q) use ($startOfMonth, $endOfMonth) {
                    $q->where('check_in', '<', $startOfMonth)
                        ->where('check_out', '>', $endOfMonth);
                });
        })
        ->with('rooms')
        ->get()
        ->reduce(function ($carry, $booking) {
            return $carry + $booking->rooms->sum('nights');
        }, 0);


        $occupancyRate = $totalRoomNights > 0 
            ? ($bookedNights / $totalRoomNights) * 100
            : 0;

        // Compare with previous month
        $prevStart = $startOfMonth->copy()->subMonth();
        $prevEnd = $prevStart->copy()->endOfMonth();
        $prevDaysInMonth = (int) $prevStart->daysInMonth;
        $prevTotalRoomNights = max(0, $totalRooms * $prevDaysInMonth);
        
        $prevBookedNights = Booking::whereBetween('created_at', [$prevStart, $prevEnd])
            ->where('booking_status', '!=', 'cancelled')
             ->where(function ($query) use ($prevStart, $prevEnd) {
                $query->whereBetween('check_in', [$prevStart, $prevEnd])
                    ->orWhereBetween('check_out', [$prevStart, $prevEnd])
                    ->orWhere(function ($q) use ($prevStart, $prevEnd) {
                        $q->where('check_in', '<', $prevStart)
                            ->where('check_out', '>', $prevEnd);
                    });
            })
            ->with('rooms')
            ->get()
            ->reduce(function ($carry, $booking) {
                return $carry + $booking->rooms()->sum('nights');
            }, 0);

        $prevOccupancyRate = $prevTotalRoomNights > 0 
            ? ($prevBookedNights / $prevTotalRoomNights) * 100
            : 0;

        $changePercent = $prevOccupancyRate > 0
            ? (($occupancyRate - $prevOccupancyRate) / $prevOccupancyRate) * 100
            : 0;

        // Room type breakdown
        $roomTypeOccupancy = Room::selectRaw('type, COUNT(*) as total_rooms')
            ->groupBy('type')
            ->get()
            ->map(function ($room) use ($daysInMonth, $startOfMonth, $endOfMonth) {
                $roomsOfType = Room::where('type', $room->type)->pluck('id');
                $bookedNights = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->with('rooms')
                    ->get()
                    ->reduce(function ($carry, $booking) use ($roomsOfType) {
                        return $carry + $booking->rooms()
                            ->whereIn('room_id', $roomsOfType)
                            ->sum('nights');
                    }, 0);

                $totalNights = $room->total_rooms * $daysInMonth;
                $rate = $totalNights > 0 ? ($bookedNights / $totalNights) * 100 : 0;

                return [
                    'room_type' => ucfirst($room->type),
                    'occupancy' => round($rate, 1),
                    'booked_nights' => $bookedNights,
                    'total_nights' => $totalNights
                ];
            });
            return response()->json([
                'occupancy' => [
                    'period' => now()->format('F Y'),
                    'overall_occupancy' => round($occupancyRate, 1),
                    'change_percent' => round($changePercent, 1),
                    'total_rooms' => $totalRooms,
                    'booked_nights' => $bookedNights,
                    'total_available_nights' => $totalRoomNights,
                    'by_room_type' => $roomTypeOccupancy
                ]
            ]);

    }

    /**
     * Get reservation report - booking statistics and trends
     */
    public function reservationReport(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        // Reservation counts (by created_at for the month)
        $totalReservations = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();
        $confirmedReservations = Booking::where('booking_status', 'confirmed')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();
        $cancelledReservations = Booking::where('booking_status', 'cancelled')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();
        $pendingReservations = Booking::where('booking_status', 'pending')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->count();

        // Previous month comparison (totals by created_at)
        $prevStart = $startOfMonth->copy()->subMonth();
        $prevEnd = $prevStart->copy()->endOfMonth();
        $prevTotalReservations = Booking::whereBetween('created_at', [$prevStart, $prevEnd])->count();

        $changePercent = $prevTotalReservations > 0
            ? round((($totalReservations - $prevTotalReservations) / $prevTotalReservations) * 100, 1)
            : 0;

        // Average booking value for the month
        $avgBookingValue = Booking::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->avg('total_amount') ?? 0;

        // Breakdown by status (safe division)
        $safeTotal = max(1, $totalReservations); // avoid div by zero
        $breakdown = [
            [
                'status' => 'Confirmed',
                'count' => $confirmedReservations,
                'percentage' => round(($confirmedReservations / $safeTotal) * 100, 1)
            ],
            [
                'status' => 'Pending',
                'count' => $pendingReservations,
                'percentage' => round(($pendingReservations / $safeTotal) * 100, 1)
            ],
            [
                'status' => 'Cancelled',
                'count' => $cancelledReservations,
                'percentage' => round(($cancelledReservations / $safeTotal) * 100, 1)
            ]
        ];

        // Upcoming reservations (next 7 days)
        $now = Carbon::now();
        $upcomingWindowEnd = $now->copy()->addDays(7)->endOfDay();
        $upcoming = Booking::whereBetween('check_in', [$now->startOfDay(), $upcomingWindowEnd])
            ->where('booking_status', '!=', 'cancelled')
            ->with(['rooms.room', 'guests'])
            ->orderBy('check_in')
            ->take(10)
            ->get()
            ->map(function ($b) {
                return [
                    'reference' => $b->reference_number,
                    'check_in' => optional($b->check_in)->toDateString(),
                    'check_out' => optional($b->check_out)->toDateString(),
                    'guests' => $b->number_of_guests,
                    'status' => $b->booking_status,
                    'rooms' => $b->rooms->map(function ($br) {
                        return optional($br->room)->room_number;
                    })->filter()->values()->all()
                ];
            })->all();

        return response()->json([
            'period' => now()->format('F Y'),
            'total_reservations' => $totalReservations,
            'change_percent' => $changePercent,
            'avg_booking_value' => round($avgBookingValue, 2),
            'metrics' => [
                'confirmed' => $confirmedReservations,
                'pending' => $pendingReservations,
                'cancelled' => $cancelledReservations
            ],
            'breakdown' => $breakdown,
            'upcoming' => $upcoming
        ]);
    }

    /**
     * Get feedback report - customer satisfaction and ratings
     */
    public function feedbackReport(): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $totalFeedback = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count();

        // Average rating
        $avgRating = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->avg('rating') ?? 0;

        // Previous month comparison
        $prevStart = $startOfMonth->copy()->subMonth();
        $prevEnd = $prevStart->copy()->endOfMonth();
        $prevAvgRating = Feedback::whereBetween('created_at', [$prevStart, $prevEnd])
            ->avg('rating') ?? 0;

        $changePercent = $prevAvgRating > 0
            ? (($avgRating - $prevAvgRating) / $prevAvgRating) * 100
            : 0;

        // Positive vs Negative feedback
        $positiveFeedback = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('rating', '>=', 4)
            ->count();
        $negativeFeedback = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->where('rating', '<', 3)
            ->count();

        // Rating distribution breakdown
        $ratingDistribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = Feedback::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->where('rating', $i)
                ->count();
            $ratingDistribution[] = [
                'category' => $i . ' Star' . ($i > 1 ? 's' : ''),
                'rating' => $i,
                'count' => $count,
                'percentage' => $totalFeedback > 0 ? round(($count / $totalFeedback) * 100, 1) : 0
            ];
        }

        return response()->json([
            'period' => now()->format('F Y'),
            'total_feedback' => $totalFeedback,
            'overall_rating' => round($avgRating, 1),
            'change_percent' => round($changePercent, 1),
            'sentiment' => [
                'positive' => $positiveFeedback,
                'negative' => $negativeFeedback
            ],
            'breakdown' => $ratingDistribution
        ]);
    }
}
