<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

// Models
use App\Models\User;
use App\Models\Classes;
use App\Models\Session;
use App\Models\Attendance;
use App\Models\PermissionRequest;

class TeacherController extends Controller
{
    // --- CLASSES & SESSIONS ---

    // Get classes for the logged-in teacher (For the Dropdown)
    public function getClasses()
    {
        $classes = Classes::where('teacher_id', Auth::id())
            ->get()
            ->map(function ($class) {
                $todaySession = Session::where('class_id', $class->id)
                    ->whereDate('created_at', today())
                    ->first();

                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'course_code' => $class->course_code,
                    'today_status' => $todaySession?->status ?? 'none',
                ];
            });

        return response()->json($classes);
    }


    // Start a class session (Generate QR)
    public function startSession(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id'
        ]);

        // Close any existing active session for today (safety)
        Session::where('class_id', $request->class_id)
            ->whereDate('created_at', now())
            ->where('status', 'active')
            ->update(['status' => 'ended']);

        $session = Session::create([
            'class_id'   => $request->class_id,
            'status'     => 'active',
            'qr_token'   => strtoupper(Str::random(6)),
            'expires_at' => now()->addMinutes(10), // 🔥 10 MINUTES LIMIT
        ]);

        return response()->json([
            'id'         => $session->id,
            'class_id'   => $session->class_id,
            'qr_token'   => $session->qr_token,
            'expires_at' => $session->expires_at,
            'status'     => $session->status,
        ]);
    }


    public function getSessionAttendance($sessionId)
    {
        $attendance = Attendance::where('session_id', $sessionId)
            ->with('student')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($attendance);
    }

    // --- STUDENT MANAGEMENT ---

    // 1. Get All Students linked to this Teacher (Generic)
    public function getMyStudents()
    {
        $teacherId = Auth::id();

        $students = User::whereHas('enrolledClasses', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })->get();

        return response()->json($students);
    }

    // 2. Get Students specific to a Class (For the "View Students" card view)
    public function getStudentsByClass($classId)
    {
        $teacherId = Auth::id();
        // Security check
        $class = Classes::where('id', $classId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $students = $class->students()->get()->map(function ($student) use ($classId) {

            $attendanceQuery = Attendance::where('student_id', $student->id)
                ->whereHas('session', function ($q) use ($classId) {
                    $q->where('class_id', $classId);
                });
            $present = (clone $attendanceQuery)->whereIn('status', ['present', 'late'])->count();
            $absent  = (clone $attendanceQuery)->where('status', 'absent')->count();
            $permit  = (clone $attendanceQuery)->whereIn('status', ['excused', 'permit'])->count();

            return [
                'id'    => $student->id,
                'name'  => $student->name,
                'email' => $student->email,

                // ✅ AVATAR FULL URL FIX
                'avatar' => $student->avatar
                    ? asset('storage/' . $student->avatar)
                    : null,

                'attendance' => [
                    'present' => $present,
                    'absent'  => $absent,
                    'permit'  => $permit,
                ],
            ];
        });

        return response()->json($students);
    }

    // Reset Student Password
    public function resetStudentPassword(Request $request, $id)
    {
        $request->validate(['new_password' => 'required|min:6']);

        $student = User::findOrFail($id);
        $student->password = Hash::make($request->new_password);
        $student->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function getClassStudents($id)
    {
        $class = Classes::findOrFail($id);
        return response()->json($class->students);
    }

    // --- ATTENDANCE & HISTORY ---

    public function getSessionHistory(Request $request)
    {
        $teacher = $request->user();

        // 1. Get the list of Class IDs that this teacher owns
        $classIds = Classes::where('teacher_id', $teacher->id)->pluck('id');

        // 2. Fetch sessions
        $sessions = Session::whereIn('class_id', $classIds)
            ->with(['schoolClass', 'attendances'])
            ->orderBy('created_at', 'desc')
            ->get();

        // 3. Format the data
        $history = $sessions->map(function ($session) {
            $total = $session->attendances->count();
            $present = $session->attendances->whereIn('status', ['present', 'late'])->count();
            $rate = $total > 0 ? round(($present / $total) * 100) : 0;

            return [
                'id' => $session->id,
                'date' => $session->created_at->format('M d, Y h:i A'),
                'time' => $session->created_at->format('h:i A'),
                'class_name' => $session->schoolClass ? $session->schoolClass->name : 'Unknown Class',
                'course_code' => $session->schoolClass ? $session->schoolClass->course_code : 'N/A',
                'status' => $session->status ?? 'completed',
                'attendance_rate' => $rate
            ];
        });

        return response()->json($history);
    }

    public function updateManualAttendance(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'student_id' => 'required|exists:users,id',
            'status' => 'required|string'
        ]);

        $session = Session::where('class_id', $request->class_id)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if (!$session) {
            $session = Session::create([
                'class_id' => $request->class_id,
                'status' => 'active',
                'qr_token' => Str::random(32),
                'expires_at' => now()->addHours(3)
            ]);
        }

        Attendance::updateOrCreate(
            [
                'session_id' => $session->id,
                'student_id' => $request->student_id
            ],
            [
                'status' => strtolower($request->status),
                'scanned_at' => now()
            ]
        );

        return response()->json(['message' => 'Attendance updated']);
    }

    // --- PERMISSION REQUESTS ---

    public function getPermissionRequests()
    {
        $teacherId = Auth::id();

        $requests = PermissionRequest::whereHas('schoolClass', function ($q) use ($teacherId) {
            $q->where('teacher_id', $teacherId);
        })
            ->where('status', 'pending')
            ->with(['student', 'schoolClass'])
            ->latest()
            ->get();

        $formatted = $requests->map(function ($req) {
            return [
                'id' => $req->id,
                'student_name' => $req->student->name,
                'class_name' => $req->schoolClass->name ?? 'Unknown',
                'type' => ucfirst($req->type),
                'reason' => $req->reason,
                'date' => $req->created_at->format('M d, h:i A'),
            ];
        });

        return response()->json($formatted);
    }

    public function handlePermissionRequest(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:approved,rejected'
        ]);

        $permission = PermissionRequest::findOrFail($id);
        $permission->update(['status' => $request->action]);

        return response()->json(['message' => 'Request ' . $request->action]);
    }
    public function endSession($sessionId)
    {
        $session = Session::with('schoolClass.students')->find($sessionId);

        if (!$session) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        // Mark ABSENT students who didn’t attend
        foreach ($session->schoolClass->students as $student) {
            Attendance::firstOrCreate(
                [
                    'session_id' => $session->id,
                    'student_id' => $student->id,
                ],
                [
                    'status' => 'absent',
                ]
            );
        }

        $session->update([
            'status' => 'ended'
        ]);

        return response()->json([
            'message' => 'Session ended. Absentees marked.'
        ]);
    }
    public function markNoClass(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'message' => 'nullable|string'
        ]);

        $session = new Session();
        $session->class_id = $request->class_id;
        $session->status = 'cancelled';
        $session->reason = $request->message;
        $session->qr_token = null;
        $session->save();

        return response()->json(['message' => 'Class cancelled successfully']);
    }

    public function getPermissions(Request $request)
    {
        $teacherId = $request->user()->id;

        $requests = PermissionRequest::whereHas('schoolClass', function ($query) use ($teacherId) {
            $query->where('teacher_id', $teacherId);
        })
            ->with(['student', 'schoolClass'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($req) {
                $req->time_ago = $req->created_at->diffForHumans();
                $req->note = $req->reason;
                return $req;
            });

        return response()->json($requests);
    }

    public function respondPermission(Request $request, $id)
    {
        $permission = PermissionRequest::findOrFail($id);
        $status = strtolower($request->status);
        $permission->update(['status' => $status]);

        if ($status === 'approved') {
            $session = Session::where('class_id', $permission->class_id)
                ->whereDate('created_at', $permission->created_at->toDateString())
                ->first();

            if ($session) {
                Attendance::updateOrCreate(
                    [
                        'session_id' => $session->id,
                        'student_id' => $permission->student_id
                    ],
                    [
                        'status' => 'excused',
                        'scanned_at' => now()
                    ]
                );
            } else {
                return response()->json([
                    'message' => 'Request approved, BUT no class session was found for this date.'
                ]);
            }
        }

        return response()->json(['message' => 'Request processed successfully.']);
    }
}
