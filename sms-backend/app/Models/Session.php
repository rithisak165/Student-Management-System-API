<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    protected $table = 'class_sessions';

    protected $fillable = [
        'class_id',
        'status',
        'qr_token',
        'reason',
        'expires_at'
    ];

    // ... Keep your existing relationships ...
    public function schoolClass() { return $this->belongsTo(Classes::class, 'class_id'); }
    public function teacher() { return $this->belongsTo(User::class, 'teacher_id'); }
    public function attendances() { return $this->hasMany(Attendance::class, 'session_id'); }
}
