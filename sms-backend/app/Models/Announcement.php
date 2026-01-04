<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// We import your existing Session model here
use App\Models\Session;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'student_id',
        'status',
        'scanned_at'
    ];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // FIX: This now points to your 'Session.php' file
    public function session()
    {
        return $this->belongsTo(Session::class, 'session_id');
    }
}
