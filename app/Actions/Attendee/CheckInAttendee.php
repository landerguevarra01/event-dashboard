<?php

namespace App\Actions\Attendee;

use App\Models\Attendee;
use App\Models\Event;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CheckInAttendee
{
    public const CHECKED_IN = 'checked_in';

    public const ALREADY_CHECKED_IN = 'already_checked_in';

    /**
     * Check in by the token read from a QR code.
     *
     * @return array{status: string, attendee: Attendee}
     *
     * @throws ValidationException
     */
    public function byToken(Event $event, string $token, User $by): array
    {
        $attendee = $event->attendees()->where('qr_token', trim($token))->first();

        // A token from another event gets the same message as an unknown one,
        // so scanning can't be used to probe other events.
        if (! $attendee) {
            throw ValidationException::withMessages([
                'token' => 'This QR code is not valid for this event.',
            ]);
        }

        return $this->byAttendee($event, $attendee, $by);
    }

    /**
     * Check in a specific attendee (used by the scanner and the manual button).
     *
     * @return array{status: string, attendee: Attendee}
     *
     * @throws ValidationException
     */
    public function byAttendee(Event $event, Attendee $attendee, User $by): array
    {
        if ($attendee->event_id !== $event->id) {
            throw ValidationException::withMessages([
                'token' => 'This attendee does not belong to this event.',
            ]);
        }

        if (! $event->status->isActive()) {
            throw ValidationException::withMessages([
                'token' => 'Check-in is only available while the event is published or ongoing.',
            ]);
        }

        // Single conditional UPDATE: if two scanners read the same code at the
        // same moment, only one of them gets to write the check-in.
        $updated = Attendee::whereKey($attendee->id)
            ->whereNull('checked_in_at')
            ->update([
                'checked_in_at' => now(),
                'checked_in_by' => $by->id,
            ]);

        return [
            'status' => $updated ? self::CHECKED_IN : self::ALREADY_CHECKED_IN,
            'attendee' => $attendee->fresh(),
        ];
    }
}