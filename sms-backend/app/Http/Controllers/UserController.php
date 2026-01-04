<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // 1. GET ALL USERS (Used by Admin to list students/teachers)
    public function index(Request $request)
    {
        $role = $request->query('role'); // e.g., ?role=student

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        // Return users with their full image URL
        return response()->json($query->get());
    }

    // 2. CREATE USER (With Image Upload)
    public function store(Request $request)
    {
        // A. Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,teacher,student',
            // Image is required, must be a file (jpeg, png, etc.), max 2MB
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // B. Handle File Upload
        $imagePath = null;
        if ($request->hasFile('profile_image')) {
            // Save to 'storage/app/public/profiles' folder
            $imagePath = $request->file('profile_image')->store('profiles', 'public');
        }

        // C. Create User in Database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'profile_image' => $imagePath, // Save the path string
            'present_count' => 0, // Default start
            'absent_count' => 0,  // Default start
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }
}
