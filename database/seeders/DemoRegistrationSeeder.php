<?php

namespace Database\Seeders;

use App\Enums\RegistrationStatus;
use App\Models\Attendee;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoRegistrationSeeder extends Seeder
{
    public function run(): void
    {
        $reviewer = User::where('email', 'eventadmin@example.com')->firstOrFail();
        $staff = User::where('email', 'staff@example.com')->firstOrFail();

        // slug => [registrations, walk-ins]
        // 'in' => true marks an approved attendee as already checked in.
        $data = [
            'annual-company-summit' => [
                'registrations' => [
                    ['Maria Santos', 'maria.santos@example.com', 'Finance', RegistrationStatus::Approved],
                    ['Juan Dela Cruz', 'juan.delacruz@example.com', 'Operations', RegistrationStatus::Approved],
                    ['Ana Reyes', 'ana.reyes@example.com', 'Marketing', RegistrationStatus::Pending],
                    ['Carlo Mendoza', 'carlo.mendoza@example.com', 'IT', RegistrationStatus::Pending],
                    ['Liza Ramos', 'liza.ramos@example.com', 'Sales', RegistrationStatus::Rejected],
                    ['Paolo Garcia', 'paolo.garcia@example.com', 'HR', RegistrationStatus::Cancelled],
                ],
                'walk_ins' => [],
            ],
            'leadership-workshop' => [
                'registrations' => [
                    ['Rico Villanueva', 'rico.villanueva@example.com', 'Operations', RegistrationStatus::Approved, 'in' => true],
                    ['Grace Tan', 'grace.tan@example.com', 'Finance', RegistrationStatus::Approved, 'in' => true],
                    ['Miguel Cruz', 'miguel.cruz@example.com', 'IT', RegistrationStatus::Approved],
                    ['Teresa Lim', 'teresa.lim@example.com', 'HR', RegistrationStatus::Pending],
                ],
                'walk_ins' => [
                    ['Noel Bautista', 'noel.bautista@example.com', 'Sales', 'in' => true],
                ],
            ],
            'year-end-gala-2025' => [
                'registrations' => [
                    ['Sofia Navarro', 'sofia.navarro@example.com', 'Marketing', RegistrationStatus::Approved, 'in' => true],
                    ['Daniel Flores', 'daniel.flores@example.com', 'Operations', RegistrationStatus::Approved, 'in' => true],
                    ['Bea Castillo', 'bea.castillo@example.com', 'Finance', RegistrationStatus::Approved],
                ],
                'walk_ins' => [],
            ],
        ];

        foreach ($data as $slug => $groups) {
            $event = Event::where('slug', $slug)->first();

            if (! $event) {
                continue;
            }

            foreach ($groups['registrations'] as $row) {
                [$name, $email, $organization, $status] = $row;
                $reviewed = $status !== RegistrationStatus::Pending;

                $registration = Registration::updateOrCreate(
                    ['event_id' => $event->id, 'email' => $email],
                    [
                        'name' => $name,
                        'organization' => $organization,
                        'status' => $status,
                        'reviewed_by' => $reviewed ? $reviewer->id : null,
                        'reviewed_at' => $reviewed ? now()->subDays(2) : null,
                    ]
                );

                // Approved registrations become attendees.
                if ($status === RegistrationStatus::Approved) {
                    $this->attendee($event, $staff, [
                        'registration_id' => $registration->id,
                        'name' => $name,
                        'email' => $email,
                        'organization' => $organization,
                    ], $row['in'] ?? false);
                }
            }

            foreach ($groups['walk_ins'] as $row) {
                [$name, $email, $organization] = $row;

                $this->attendee($event, $staff, [
                    'registration_id' => null,
                    'name' => $name,
                    'email' => $email,
                    'organization' => $organization,
                ], $row['in'] ?? false);
            }
        }
    }

    private function attendee(Event $event, User $staff, array $attributes, bool $checkedIn): void
    {
        Attendee::updateOrCreate(
            ['event_id' => $event->id, 'email' => $attributes['email']],
            $attributes + [
                'checked_in_at' => $checkedIn ? $event->starts_at?->copy()->addMinutes(15) : null,
                'checked_in_by' => $checkedIn ? $staff->id : null,
            ]
        );
    }
}