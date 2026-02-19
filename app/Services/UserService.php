<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class UserService
{
    

    public function updateUser(User $targetUser, array $data)
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $targetUser->id) {
            throw ValidationException::withMessages([
                'error' => 'You cannot edit your own account.'
            ]);
        }

        if ($targetUser->role === 'admin') {
            throw ValidationException::withMessages([
                'error' => 'You cannot edit another administrator.'
            ]);
        }

        $targetUser->update($data);

        return $targetUser;
    }

    public function deleteUser(User $targetUser)
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $targetUser->id) {
            throw ValidationException::withMessages([
                'error' => 'You cannot delete your own account.'
            ]);
        }

        if ($targetUser->role === 'admin') {

            $adminCount = User::where('role', 'admin')->count();

            if ($adminCount <= 1) {
                throw ValidationException::withMessages([
                    'error' => 'Cannot delete the last remaining administrator.'
                ]);
            }

            throw ValidationException::withMessages([
                'error' => 'You cannot delete another administrator.'
            ]);
        }

        $targetUser->delete();

        return true;
    }
}
