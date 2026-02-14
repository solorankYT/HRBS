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
            'name' => "required|string|max:255|min:2",
            'email' => "required|string|email|max:255|unique:users,email",
            'password' => 'required|string|min:8|confirmed',
            'phone_number' => 'required|string|min:10|max:20',
            'role' => 'required|in:admin,receptionist'
        ], [
            'name.required' => 'Name is required',
            'name.min' => 'Name must be at least 2 characters',
            'email.required' => 'Email is required',
            'email.email' => 'Email must be a valid email address',
            'email.unique' => 'Email already exists',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
            'password.confirmed' => 'Passwords do not match',
            'phone_number.required' => 'Contact number is required',
            'phone_number.min' => 'Contact number must be at least 10 digits',
            'role.required' => 'Role is required',
            'role.in' => 'Invalid role selected'
        ]);

        $validate['password'] = Hash::make($validate['password']);

        User::create($validate);

         return response()->json(['message' => 'User Added successfully'], 201);
    }

public function update(Request $request, $userid)
{
    $user = User::findOrFail($userid);

    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|string|max:255|email|unique:users,email,' . $user->id,
        'role' => 'sometimes|in:admin,receptionist',
        'status' => 'sometimes|in:active,inactive',
        'phone_number' => 'sometimes|string|min:10|max:20',
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