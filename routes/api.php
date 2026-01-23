<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RoomManagementController;
use App\Http\Controllers\UserManagementController;

Route::middleware('web')->group(function () {
    Route::post('/login', [AuthenticationController::class, 'login']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');



});

//USER MANAGEMENTT
Route::get('/users', [UserManagementController::class, 'index']);
Route::get('/users/{id}', [UserManagementController::class, 'show']);
Route::post('/users', [UserManagementController::class, 'create']);
Route::put('/users/{id}', [UserManagementController::class, 'update']);
Route::delete('/users/{id}', [UserManagementController::class, 'delete']);


//ROOMMM MANAMANGEMETTs
Route::get('/rooms', [RoomManagementController::class, 'index']);

