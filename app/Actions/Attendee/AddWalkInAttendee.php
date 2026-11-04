<?php

namespace App\Actions\Attendee;

use App\Enums\EventStatus;
use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Validation\ValidationException;

class AddWalkInAttendee
{
    /**
     * Add an attendee directly, without a registration (a walk-in).
     *
     * @param  array<string, mixed>  $data
     *
     * @throws ValidationException
     */
    public function handle(Event $event, array $data): Attendee
    {
        if (in_array($event->status, [EventStatus::Completed, EventStatus::Archived], true)) {
            throw ValidationException::withMessages([
                'attendee' => 'This event is closed, so attendees can no longer be added.',
            ]);
        }

        if ($event->capacity !== null && $event->attendees()->count() >= $event->capacity) {
            throw ValidationException::withMessages([
                'attendee' => 'This event is full. Raise the capacity before adding more attendees.',
            ]);
        }

        return $event->attendees()->create([
            'registration_id' => null,
            'name' => $data['name'],
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'organization' => $data['organization'] ?? null,
        ]);
    }
}
