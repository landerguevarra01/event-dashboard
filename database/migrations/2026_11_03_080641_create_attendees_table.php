<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();

            // Set when the attendee came from an approved registration.
            // Null for walk-ins added directly. One attendee per registration.
            $table->foreignId('registration_id')->nullable()->unique()
                ->constrained()->nullOnDelete();

            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('organization')->nullable();

            // Random token encoded in the attendee's QR code
            $table->string('qr_token', 64)->unique();

            // Check-in state (filled in by the scanner in Phase 5)
            $table->dateTime('checked_in_at')->nullable();
            $table->foreignId('checked_in_by')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();

            // The same email can be an attendee of an event only once
            $table->unique(['event_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendees');
    }
};
