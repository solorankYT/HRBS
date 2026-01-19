<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthenticationController;

Route::get('/user', function (Request $request) {
    return ['ok' => true];
});


Route::get('/admin/user/{id}', [App\Http\Controllers\AdminController::class, 'show']);


//Authentication Routes
Route::post('/login', [AuthenticationController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthenticationController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});
