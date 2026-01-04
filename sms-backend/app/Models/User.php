<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id_number',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Relationships
    public function teachingClasses()
    {
        return $this->hasMany(\App\Models\Classes::class, 'teacher_id');
    }

    public function enrolledClasses()
    {
        return $this->belongsToMany(
            \App\Models\Classes::class,
            'class_student',
            'student_id',
            'class_id'
        );
    }

    public function attendances()
    {
        return $this->hasMany(\App\Models\Attendance::class, 'student_id');
    }
}
