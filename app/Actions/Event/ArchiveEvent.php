<?php

namespace App\Actions\Event;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class ArchiveEvent
{
    /**
     * Archive a completed event. Archived events are read-only.
     *
     * @throws ValidationException
     */
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Completed) {
            throw ValidationException::withMessages([
                'operation' => 'Only completed events can be archived.',
            ]);
        }

        $event->update([
            'status' => EventStatus::Archived,
            'archived_at' => now(),
        ]);

        return $event;
    }
}
