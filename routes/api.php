<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\Guest\RoomController as GuestRoomController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomManagementController;
use App\Http\Controllers\UserManagementController;

Route::middleware('web')->group(function () {
    Route::post('/login', [AuthenticationController::class, 'login']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');
});

//ADMIN ROUTES
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


//Public Routes
Route::prefix('guest')->middleware('web')->group(function () {

    // Rooms
    Route::get('/rooms', [GuestRoomController::class, 'index']);
    Route::get('/rooms/availability', [GuestRoomController::class, 'availability']);
    Route::get('/rooms/{room}', [GuestRoomController::class, 'show']);

    // // Bookings
    // Route::post('/bookings', [GuestBookingController::class, 'store']);
    // Route::get('/bookings/{reference}', [GuestBookingController::class, 'show']);
    // Route::post('/bookings/{reference}/cancel', [GuestBookingController::class, 'cancel']);
});
