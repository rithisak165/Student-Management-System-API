<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Session; // You need this model to find the class by Code
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $student = $request->user();

        $session = Session::where('qr_token', $request->code)
            ->where('status', 'active')
            ->first();

        if (!$session) {
            return response()->json([
                'message' => 'Invalid or inactive session'
            ], 404);
        }

        // ⛔ TIME LIMIT CHECK
        if (now()->greaterThan($session->expires_at)) {
            return response()->json([
                'message' => 'Attendance time expired (10 minutes only)'
            ], 403);
        }

        // Prevent double scan
        Attendance::updateOrCreate(
            [
                'session_id' => $session->id,
                'student_id' => $student->id,
            ],
            [
                'status'     => 'present',
                'scanned_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Attendance marked successfully'
        ]);
    }


    public function history(Request $request)
    {
        $user = $request->user();

        // CHANGE 'school_class' TO 'schoolClass'
        $history = Attendance::with(['session.schoolClass.teacher'])
            ->where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
