<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return ['ok' => true];
});


Route::get('/admin/user/{id}', [App\Http\Controllers\AdminController::class, 'show']);


