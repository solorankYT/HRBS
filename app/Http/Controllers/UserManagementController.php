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

public function update(Request $request, $userid)
{
    $user = User::findOrFail($userid);

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|max:255|email|unique:users,email,' . $user->id,
        'password' => 'nullable|string|min:8',
        'role' => 'required|in:admin,receptionist',
    ]);

    if (!empty($validated['password'])) {
        $validated['password'] = Hash::make($validated['password']);
    } else {
        unset($validated['password']);
    }

    $user->update($validated);

    return response()->json([
        'message' => 'User updated successfully',
        'user' => $user
    ]);
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