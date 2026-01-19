<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{

public function show(string $id): JsonResponse
{
      $user = User::findOrFail($id);

    return response()->json($user);
}


}