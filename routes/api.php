<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\Guest\RoomController as GuestRoomController;
use App\Http\Controllers\RoomManagementController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\Guest\BookingController as GuestBookingController;
use App\Http\Controllers\Receptionist\ReservationController as ReservationController;
use App\Http\Controllers\Receptionist\PaymentController as ReceptionistPaymentController;
use App\Http\Controllers\Receptionist\CheckOutController as ReceptionistCheckOutController;
use App\Http\Controllers\Admin\ReportsController;

Route::middleware('web')->group(function () {
    Route::post('/login', [AuthenticationController::class, 'login']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});

Route::prefix('guest')->middleware('api')->group(function () {

    // Rooms
    Route::get('/rooms', [GuestRoomController::class, 'index']);
    Route::get('/rooms/availability', [GuestRoomController::class, 'availability']);
    Route::get('/rooms/{room}', [GuestRoomController::class, 'show']);

    // Bookings
    Route::post('/bookings', [GuestBookingController::class, 'store']);
    Route::get('/bookings/{reference}', [GuestBookingController::class, 'show']);
    Route::get('/bookings/{reference}/showCancel', [GuestBookingController::class, 'showCancel']);
    Route::post('/bookings/{reference}/cancel', [GuestBookingController::class, 'cancel']);
    Route::post('/bookings/{reference}/payment-proof', [GuestBookingController::class, 'submitPaymentProof']);
    Route::get('/bookings/success/{reference}', [GuestBookingController::class, 'bookingSuccess']);
});

Route::prefix('receptionist')->middleware('api')->group(function () {
    Route::get('/payments', [ReceptionistPaymentController::class, 'index']);
    Route::get('/payments/{id}', [ReceptionistPaymentController::class, 'show']);
    Route::post('/payments/{id}/status', [ReceptionistPaymentController::class, 'updateStatus']);
    Route::post('/checkouts/{reference}', [ReceptionistCheckOutController::class, 'complete']);
    Route::get('/checkouts/{reference}', [ReceptionistCheckOutController::class, 'show']);
    Route::get('/reservation/lookup', [ReservationController::class, 'lookupByReference']);
});

//ADMIN ROUTES
Route::prefix('admin')->middleware('api')->group(function () {
    // Reports
    Route::get('/reports/revenue', [ReportsController::class, 'revenueReport']);
    Route::get('/reports/breakdown', [ReportsController::class, 'revenueBreakdown']);
    Route::get('/reports/trends', [ReportsController::class, 'dailyTrend']);
    Route::get('/reports/occupancy', [ReportsController::class, 'occupancyReport']);
    Route::get('/reports/reservations', [ReportsController::class, 'reservationReport']);
    Route::get('/reports/feedback', [ReportsController::class, 'feedbackReport']);
    Route::get('/reports/dashboard', [ReportsController::class, 'dashboard']);
});

//USER MANAGEMENTT
Route::get('/users', [UserManagementController::class, 'index']);
Route::get('/users/{id}', [UserManagementController::class, 'show']);
Route::post('/users', [UserManagementController::class, 'create']);
Route::put('/users/{id}', [UserManagementController::class, 'update']);
Route::delete('/users/{id}', [UserManagementController::class, 'delete']);


//ROOMMM MANAMANGEMETTs
Route::get('/rooms', [RoomManagementController::class, 'index']);
Route::post('/rooms', [RoomManagementController::class, 'create']);
Route::put('/rooms/{id}', [RoomManagementController::class, 'update']);
Route::get('/rooms/{id}', [RoomManagementController::class, 'show']);



Route::get('/reservation', [ReservationController::class, 'index']);
Route::get('/reservation/{id}', [ReservationController::class, 'show']);
Route::patch('/reservation/checkin/{id}', [ReservationController::class, 'checkIn']);


//Public Routes
