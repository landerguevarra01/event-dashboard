<?php

namespace App\Actions\Event;

use App\Enums\EventStatus;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class PublishEvent
{
    /**
     * Move a draft event to Published, if it is ready.
     *
     * @throws ValidationException
     */
    public function handle(Event $event): Event
    {
        if ($event->status !== EventStatus::Draft) {
            throw ValidationException::withMessages([
                'publish' => 'Only draft events can be published.',
            ]);
        }

        $problems = [];

        if (! $event->starts_at || ! $event->ends_at) {
            $problems[] = 'Set the start and end dates.';
        }

        if (! $event->users()->wherePivot('role', 'event_admin')->exists()) {
            $problems[] = 'Assign at least one Event Admin.';
        }

        if ($problems !== []) {
            throw ValidationException::withMessages([
                'publish' => implode(' ', $problems),
            ]);
        }

        $event->update(['status' => EventStatus::Published]);

        return $event;
    }
}