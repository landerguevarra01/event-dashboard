<?php

namespace App\Actions\Registration;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Models\Attendee;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApproveRegistration
{
    /**
     * Approve a pending registration and create the attendee (with QR token).
     *
     * @throws ValidationException
     */
    public function handle(Registration $registration, User $reviewer): Registration
    {
        $event = $registration->event;

        if (in_array($event->status, [EventStatus::Completed, EventStatus::Archived], true)) {
            throw ValidationException::withMessages([
                'registration' => 'This event is closed, so registrations can no longer be changed.',
            ]);
        }

        if ($registration->status !== RegistrationStatus::Pending) {
            throw ValidationException::withMessages([
                'registration' => 'Only pending registrations can be approved.',
            ]);
        }

        if ($event->capacity !== null && $event->attendees()->count() >= $event->capacity) {
            throw ValidationException::withMessages([
                'registration' => 'This event is full. Raise the capacity before approving more registrations.',
            ]);
        }

        DB::transaction(function () use ($registration, $reviewer, $event) {
            $registration->update([
                'status' => RegistrationStatus::Approved,
                'reviewed_by' => $reviewer->id,
                'reviewed_at' => now(),
            ]);

            // One attendee per registration, so approving twice can't duplicate it.
            Attendee::firstOrCreate(
                ['registration_id' => $registration->id],
                [
                    'event_id' => $event->id,
                    'name' => $registration->name,
                    'email' => $registration->email,
                    'phone' => $registration->phone,
                    'organization' => $registration->organization,
                ]
            );
        });

        return $registration;
    }
}