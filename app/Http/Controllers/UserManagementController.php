<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserManagementController extends Controller
{


public function show(string $id): JsonResponse
{
    $user = User::findOrFail($id);

    return response()->json($user);
}

    public function index(): JsonResponse
    {
    $users = User::all();
    return response()->json($users);
    }

    public function create(Request $request )
    {
        $validate = $request->validate([
            'name' => "required|string|max:255",
            'email' => "required|string|max:255",
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,receptionist'
        ]);

        $validate['password'] = Hash::make($validate['password']);


        User::create($validate);

         return response()->json(['message' => 'User Added']);
    }


    public function delete($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ], 200);
    }




}