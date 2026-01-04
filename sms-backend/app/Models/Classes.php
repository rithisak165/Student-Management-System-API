<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classes extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'course_code',
        'teacher_id',
        'description'
    ];

    // 1. RELATIONSHIP TO TEACHER (Missing Piece)
    public function teacher()
    {
        // This assumes the 'classes' table has a 'teacher_id' column
        return $this->belongsTo(User::class, 'teacher_id');
    }

    // 2. RELATIONSHIP TO SESSIONS
    public function sessions()
    {
        return $this->hasMany(Session::class, 'class_id');
    }

    // 3. RELATIONSHIP TO STUDENTS
    public function students()
    {
        return $this->belongsToMany(User::class, 'class_student', 'class_id', 'student_id');
    }
}
