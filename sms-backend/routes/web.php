<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/debug-history', function () {
    try {
        // Hardcode a teacher ID that exists (e.g., 1)
        $sessions = \App\Models\Session::where('teacher_id', 1)
            ->with(['schoolClass', 'attendances'])
            ->get();
        return $sessions;
    } catch (\Exception $e) {
        return $e->getMessage(); // THIS WILL SHOW US THE REAL ERROR
    }
});
