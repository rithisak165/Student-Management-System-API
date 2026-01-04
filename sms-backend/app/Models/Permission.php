<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $fillable = ['student_id', 'type', 'note', 'status'];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
