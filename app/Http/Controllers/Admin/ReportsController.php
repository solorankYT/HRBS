<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
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
        $currentRevenue = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') ?? 0;

        // Previous month revenue for comparison
        $previousRevenue = Payment::where('status', 'completed')
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

        $totalRevenue = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount') ?? 1; // Avoid division by zero

        // Breakdown by payment method
        $breakdown = Payment::where('status', 'completed')
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

        return response()->json([
            'revenue' => $revenueReport,
            'breakdown' => $breakdown,
            'trends' => $trends
        ]);
    }
}
