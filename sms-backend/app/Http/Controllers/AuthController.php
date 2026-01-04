<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate Input
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Attempt Login
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials provided.']
            ]);
        }

        // 3. Get the User and ATTACH the Classes
        /** @var \App\Models\User $user */
        $user = Auth::user();

        // THIS IS THE KEY LINE:
        // It tells Laravel to find the student's classes before sending the response
        $user->load('enrolledClasses');

        // 4. Generate Token
        $token = $user->createToken('auth_token')->plainTextToken;

        // 5. Return Response
        return response()->json([
            'message' => 'Login success',
            'user' => $user, // Now includes 'enrolled_classes' array for React
            'access_token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
