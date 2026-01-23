<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\JsonResponse;

class RoomManagementController extends Controller
{
    public function index(): JsonResponse
    {
    $rooms = Room::all();
    return response()->json($rooms);
    }

}