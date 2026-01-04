<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionRequest extends Model
{
    use HasFactory;

    protected $fillable = ['class_id', 'student_id', 'type', 'reason', 'status'];

    public function student() {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function schoolClass() {
        return $this->belongsTo(Classes::class, 'class_id');
    }
}
