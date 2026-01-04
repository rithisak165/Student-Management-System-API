<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Classes;
use App\Models\Attendance;
use App\Models\PermissionRequest;
use App\Models\Session;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    // 1. Get Dashboard Stats (Attendance % and Class Count)
    public function getDashboardStats(Request $request)
    {
        $student = $request->user();

        // Calculate Attendance Percentage
        // We count ALL attendance records (Present, Late, Absent, Excused)
        $totalSessions = Attendance::where('student_id', $student->id)->count();

        // We count 'excused' as present so the percentage doesn't drop
        $presentSessions = Attendance::where('student_id', $student->id)
            ->whereIn('status', ['present', 'late', 'excused']) // <--- ADDED 'excused' HERE
            ->count();

        $attendanceRate = $totalSessions > 0 ? round(($presentSessions / $totalSessions) * 100) : 0;

        return response()->json([
            'attendanceRate' => $attendanceRate,
            'totalClasses' => $student->enrolledClasses()->count()
        ]);
    }

    // 2. Get List of Enrolled Classes (FIXES YOUR 500 ERROR)
    public function getEnrolledClasses(Request $request)
    {
        $student = $request->user();

        // Check if the relationship exists to prevent crash
        if (!method_exists($student, 'enrolledClasses')) {
            return response()->json(['error' => 'User model missing enrolledClasses relationship'], 500);
        }

        // Fetch classes with teacher details
        $classes = $student->enrolledClasses()
            ->with('teacher:id,name')
            ->get();

        return response()->json($classes);
    }

    // 3. Get Details for a Specific Class
    public function getClassDetails(Request $request, $id)
    {
        $student = $request->user();

        // Get class with teacher
        $class = $student->enrolledClasses()
            ->with('teacher')
            ->where('classes.id', $id)
            ->first();

        if (!$class) {
            return response()->json(['error' => 'Class not found'], 404);
        }

        // Attendance history
        $attendance = Attendance::where('student_id', $student->id)
            ->whereHas('session', function ($q) use ($id) {
                $q->where('class_id', $id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $class->my_attendance = $attendance;

        // ---------- TODAY LOGIC ----------
        $todaySession = Session::where('class_id', $id)
            ->whereDate('created_at', now())
            ->first();

        if ($todaySession && $todaySession->status === 'cancelled') {
            $class->today_status = 'cancelled';
            $class->cancel_reason = $todaySession->cancel_reason;
            $class->stats = null;
        } else {
            $totalStudents = max(1, $class->students()->count());
            $presentToday = $todaySession
                ? Attendance::where('session_id', $todaySession->id)
                ->where('status', 'present')
                ->count()
                : 0;

            $class->today_status = 'normal';
            $class->stats = [
                'present_today' => $presentToday,
                'total_students' => $totalStudents,
                'percentage' => round(($presentToday / $totalStudents) * 100)
            ];
        }

        // ---------- AVATAR FIX ----------
        if ($class->teacher && $class->teacher->avatar) {
            $class->teacher->avatar = asset('storage/' . $class->teacher->avatar);
        }

        return response()->json($class);
    }



    public function getClassmates(Request $request, $id)
    {
        $class = Classes::findOrFail($id);

        $totalSessions = Session::where('class_id', $id)->count();

        $students = $class->students->map(function ($student) use ($id, $totalSessions) {

            $attendance = Attendance::where('student_id', $student->id)
                ->whereHas('session', fn($q) => $q->where('class_id', $id));

            $present = (clone $attendance)->whereIn('status', ['present', 'late'])->count();
            $permission = (clone $attendance)->where('status', 'excused')->count();
            $absent = max(0, $totalSessions - ($present + $permission));

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->avatar
                    ? asset('storage/' . $student->avatar)
                    : null,
                'stats' => [
                    'present' => $present,
                    'absent' => $absent,
                    'permission' => $permission,
                ],
            ];
        });

        return response()->json($students);
    }

    public function submitRequest(Request $request)
    {
        // 1. Validate that class_id is present and exists
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'type'     => 'required|string',
            'reason'   => 'required|string',
        ]);

        // 2. Create the request using your existing Model
        $permission = PermissionRequest::create([
            'student_id' => $request->user()->id,
            'class_id'   => $request->class_id,
            'type'       => $request->type,
            'reason'     => $request->reason,
            'status'     => 'pending' // Matches your migration default
        ]);

        return response()->json(['message' => 'Request submitted successfully', 'data' => $permission]);
    }

    public function getRequests(Request $request)
    {
        // Include 'schoolClass' so we can show the class name in the history
        return PermissionRequest::with('schoolClass')
            ->where('student_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
