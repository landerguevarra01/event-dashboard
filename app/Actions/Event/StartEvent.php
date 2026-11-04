<?php

namespace App\Actions\Event;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class StartEvent
{
    /**
     * Move a published event to Ongoing, which is when check-in opens up
     * for day-of operations.
     *
     * @throws ValidationException
     */
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Published) {
            throw ValidationException::withMessages([
                'operation' => 'Only published events can be started.',
            ]);
        }

        $event->update([
            'status' => EventStatus::Ongoing,
            'started_at' => now(),
        ]);

        return $event;
    }
}
