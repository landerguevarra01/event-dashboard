<?php

namespace App\Actions\Registration;

use App\Enums\EventStatus;
use App\Enums\RegistrationStatus;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class RejectRegistration
{
    /**
     * Reject a pending registration.
     *
     * @throws ValidationException
     */
    public function handle(Registration $registration, User $reviewer): Registration
    {
        if (in_array($registration->event->status, [EventStatus::Completed, EventStatus::Archived], true)) {
            throw ValidationException::withMessages([
                'registration' => 'This event is closed, so registrations can no longer be changed.',
            ]);
        }

        if ($registration->status !== RegistrationStatus::Pending) {
            throw ValidationException::withMessages([
                'registration' => 'Only pending registrations can be rejected.',
            ]);
        }

        $registration->update([
            'status' => RegistrationStatus::Rejected,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        return $registration;
    }
}