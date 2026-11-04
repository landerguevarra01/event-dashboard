<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Review Attendance step: who confirmed the attendance numbers, and when
            $table->dateTime('attendance_reviewed_at')->nullable();
            $table->foreignId('attendance_reviewed_by')->nullable()
                ->constrained('users')->nullOnDelete();

            // When the event actually started, finished, and was archived
            $table->dateTime('started_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('archived_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('attendance_reviewed_by');
            $table->dropColumn([
                'attendance_reviewed_at',
                'started_at',
                'completed_at',
                'archived_at',
            ]);
        });
    }
};
