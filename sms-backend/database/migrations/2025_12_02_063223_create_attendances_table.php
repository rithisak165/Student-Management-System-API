<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // FIX 1: The table name must be 'attendances', not 'permissions'
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            // FIX 2: Point to 'class_sessions' because that is what your DB uses
            $table->foreignId('session_id')
                  ->constrained('class_sessions')
                  ->onDelete('cascade');

            $table->foreignId('student_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->string('status')->default('present');
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
