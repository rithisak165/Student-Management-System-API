<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Classes;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    // 1. Dashboard Stats
    public function getStats()
    {
        return response()->json([
            'teacherCount' => User::where('role', 'teacher')->count(),
            'studentCount' => User::where('role', 'student')->count(),
            'classCount'   => Classes::count(),
        ]);
    }

    // 2. User Management: Get All Users
    public function getUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        // 👇 FIX: Transform the data to send FULL URLs for avatars
        $users->transform(function ($user) {
            if ($user->avatar) {
                // If avatar exists, convert "avatars/img.png" -> "http://localhost/storage/avatars/img.png"
                $user->avatar = asset('storage/' . $user->avatar);
            }
            return $user;
        });

        return response()->json($users);
    }

    // 3. User Management: Create New User
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,teacher,student',
            'student_id_number' => 'nullable|required_if:role,student|unique:users',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'student_id_number' => $request->student_id_number,
        ];

        // ✅ IMAGE UPLOAD (IMPORTANT)
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path; // <-- SAVE PATH TO DB
        }

        $user = User::create($data);

        // return full image URL
        if ($user->avatar) {
            $user->avatar = asset('storage/' . $user->avatar);
        }

        return response()->json($user, 201);
    }


    // 4. Delete User
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        // Optional: Delete the image file from storage to save space
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    // 5. Get All Classes
    public function getClasses()
    {
        return response()->json(
            Classes::with(['teacher', 'students'])
                ->withCount('students')
                ->get()
        );
    }

    // 6. Create Class
    public function createClass(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'course_code' => 'required|unique:classes',
            'teacher_id' => 'required|exists:users,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id'
        ]);

        $class = Classes::create([
            'name' => $request->name,
            'course_code' => $request->course_code,
            'teacher_id' => $request->teacher_id,
            'description' => $request->description ?? ''
        ]);

        if ($request->has('student_ids')) {
            $class->students()->attach($request->student_ids);
        }

        return response()->json($class->load('teacher'), 201);
    }

    // 7. Get Teachers
    public function getTeachers()
    {
        return response()->json(User::where('role', 'teacher')->get());
    }

    // 8. UpdateClass Class
    public function updateClass(Request $request, $id)
    {
        // 1. Find the class
        $class = Classes::findOrFail($id);

        // 2. Validate
        $request->validate([
            'name' => 'required|string',
            // 'unique' syntax: table,column,except_id
            'course_code' => 'required|unique:classes,course_code,' . $id,
            'teacher_id' => 'required|exists:users,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id'
        ]);

        // 3. Update basic details
        $class->update([
            'name' => $request->name,
            'course_code' => $request->course_code,
            'teacher_id' => $request->teacher_id,
        ]);

        // 4. Sync students (Update the pivot table)
        if ($request->has('student_ids')) {
            $class->students()->sync($request->student_ids);
        }

        // 5. Return response with relationships loaded
        return response()->json($class->load(['teacher', 'students']));
    }

    // 9. Get Attendance Report
    public function getClassReport($classId)
    {
        $class = Classes::with('students')->findOrFail($classId);

        // 1️⃣ Count ONLY ended sessions
        $endedSessions = $class->sessions()
            ->where('status', 'ended')
            ->pluck('id');

        $totalSessions = $endedSessions->count();

        // 2️⃣ Build student report
        $report = $class->students->map(function ($student) use ($endedSessions, $totalSessions) {

            // Count PRESENT + LATE
            $presentCount = Attendance::whereIn('session_id', $endedSessions)
                ->where('student_id', $student->id)
                ->whereIn('status', ['present', 'late'])
                ->count();

            $percentage = $totalSessions > 0
                ? round(($presentCount / $totalSessions) * 100)
                : 0;

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->avatar ? asset('storage/' . $student->avatar) : null,
                'present_count' => $presentCount,
                'total_sessions' => $totalSessions,
                'percentage' => $percentage
            ];
        });

        return response()->json([
            'class_name' => $class->name,
            'total_sessions' => $totalSessions,
            'students' => $report
        ]);
    }

    public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email,' . $user->id,
        'student_id_number' => 'nullable|string|unique:users,student_id_number,' . $user->id,
        'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
    ]);

    // BASIC FIELDS
    $user->name = $request->name;
    $user->email = $request->email;

    if ($request->has('student_id_number')) {
        $user->student_id_number = $request->student_id_number;
    }

    // AVATAR UPDATE (SAFE)
    if ($request->hasFile('avatar')) {

        // delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
    }

    $user->save();

    // RETURN USER WITH FULL AVATAR URL
    return response()->json([
        'message' => 'User updated successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'student_id_number' => $user->student_id_number,
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]
    ]);
}
}
