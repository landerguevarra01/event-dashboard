<?php

namespace App\Actions\Event;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ConfirmAttendanceReview
{
    /**
     * Record that an admin has reviewed the attendance numbers.
     * This is the "Review Attendance" step, and it must happen before the
     * event can be marked as completed.
     *
     * @throws ValidationException
     */
    public function handle(Event $event, User $reviewer): Event
    {
        if ($event->status !== EventStatus::Ongoing) {
            throw ValidationException::withMessages([
                'operation' => 'Attendance can only be reviewed while the event is ongoing.',
            ]);
        }

        $event->update([
            'attendance_reviewed_at' => now(),
            'attendance_reviewed_by' => $reviewer->id,
        ]);

        return $event;
    }
}
