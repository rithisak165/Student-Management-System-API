<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Middleware\IsAdmin;

/*
|--------------------------------------------------------------------------
| Public Routes (No Login Required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Login Required via Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->group(function () {

    // 1. COMMON ROUTES (All Roles)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);


    // 2. ADMIN ROUTES
    Route::middleware([IsAdmin::class])->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'getStats']);

        // User Management
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::put('/users/{id}', [AdminController::class, 'update']);
        // Class Management
        Route::get('/classes', [AdminController::class, 'getClasses']);
        Route::post('/classes', [AdminController::class, 'createClass']);
        Route::put('/classes/{id}', [AdminController::class, 'updateClass']);

        Route::get('/reports/{id}', [AdminController::class, 'getClassReport']);
        Route::get('/teachers', [AdminController::class, 'getTeachers']);
    });


    // 3. TEACHER ROUTES
    Route::prefix('teacher')->group(function () {
        Route::get('/dashboard', [TeacherController::class, 'getDashboardStats']);

        // Classes & Students
        Route::get('/classes', [TeacherController::class, 'getClasses']);
        Route::get('/classes/{id}/students', [TeacherController::class, 'getClassStudents']);
        Route::get('/students', [TeacherController::class, 'getMyStudents']);
        Route::post('/student/{id}/reset-password', [TeacherController::class, 'resetStudentPassword']);
        Route::get('/my-classes-list', [TeacherController::class, 'getClasses']);
        Route::get('/class-students/{classId}', [TeacherController::class, 'getStudentsByClass']);
        // Session Management
        Route::post('/session', [TeacherController::class, 'startSession']);
        Route::post('/session/{id}/end', [TeacherController::class, 'endSession']);
        Route::get('/session/{id}/attendance', [TeacherController::class, 'getSessionAttendance']);
        Route::post('/attendance/update', [TeacherController::class, 'updateManualAttendance']);
        Route::get('/all-students', [TeacherController::class, 'index']);
        Route::post('/no-class', [TeacherController::class, 'markNoClass']);
        Route::get('/history', [TeacherController::class, 'getSessionHistory']);

        // Permission Requests
        Route::get('/permissions', [TeacherController::class, 'getPermissions']);
        Route::post('/permissions/{id}/respond', [TeacherController::class, 'respondPermission']);
    });


    // 4. STUDENT ROUTES
    Route::prefix('student')->group(function () {
        Route::get('/dashboard-stats', [StudentController::class, 'getDashboardStats']);

        // Class Info
        Route::get('/classes', [StudentController::class, 'getEnrolledClasses']);
        Route::get('/class/{id}', [StudentController::class, 'getClassDetails']);
        Route::get('/class/{id}/classmates', [StudentController::class, 'getClassmates']);

        // Attendance Scanning
        Route::post('/attendance/scan', [AttendanceController::class, 'scan']);
        Route::get('/attendance/history', [AttendanceController::class, 'history']);

        // Permission Requests
        Route::post('/request', [StudentController::class, 'submitRequest']);
        Route::get('/requests', [StudentController::class, 'getRequests']);
    });

});
