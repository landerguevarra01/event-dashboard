<?php

namespace App\Actions\Event;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class CompleteEvent
{
    /**
     * Mark an ongoing event as completed, once its attendance has been reviewed.
     *
     * @throws ValidationException
     */
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Ongoing) {
            throw ValidationException::withMessages([
                'operation' => 'Only ongoing events can be marked as completed.',
            ]);
        }

        if ($event->attendance_reviewed_at === null) {
            throw ValidationException::withMessages([
                'operation' => 'Review the attendance before marking the event as completed.',
            ]);
        }

        // If anyone was checked in after the review, the confirmed numbers are out of date.
        $checkedInAfterReview = $event->attendees()
            ->where('checked_in_at', '>', $event->attendance_reviewed_at)
            ->exists();

        if ($checkedInAfterReview) {
            throw ValidationException::withMessages([
                'operation' => 'Someone checked in after the attendance was reviewed. Review the attendance again before completing.',
            ]);
        }

        $event->update([
            'status' => EventStatus::Completed,
            'completed_at' => now(),
        ]);

        return $event;
    }
}
