<?php

namespace Database\Seeders;

use App\Enums\EventStatus;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoEventSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::where('email', 'superadmin@example.com')->firstOrFail();
        $eventAdmin = User::where('email', 'eventadmin@example.com')->firstOrFail();
        $staff = User::where('email', 'staff@example.com')->firstOrFail();

        $events = [
            [
                'title' => 'Annual Company Summit',
                'venue' => 'Main Convention Hall',
                'status' => EventStatus::Published,
                'starts_at' => now()->addDays(14)->setTime(9, 0),
                'ends_at' => now()->addDays(14)->setTime(17, 0),
                'capacity' => 300,
                'admins' => [$eventAdmin],
                'staff' => [$staff],
            ],
            [
                'title' => 'Product Launch Night',
                'venue' => 'Rooftop Venue',
                'status' => EventStatus::Draft,
                'starts_at' => now()->addDays(30)->setTime(18, 0),
                'ends_at' => now()->addDays(30)->setTime(22, 0),
                'capacity' => 150,
                'admins' => [$eventAdmin],
                'staff' => [],
            ],
            [
                'title' => 'Leadership Workshop',
                'venue' => 'Training Room B',
                'status' => EventStatus::Ongoing,
                'starts_at' => now()->setTime(8, 0),
                'ends_at' => now()->setTime(16, 0),
                'capacity' => 60,
                'admins' => [$eventAdmin],
                'staff' => [$staff],
            ],
            [
                'title' => 'Year-End Gala 2025',
                'venue' => 'Grand Ballroom',
                'status' => EventStatus::Completed,
                'starts_at' => now()->subDays(30)->setTime(18, 0),
                'ends_at' => now()->subDays(30)->setTime(23, 0),
                'capacity' => 200,
                'admins' => [$eventAdmin],
                'staff' => [],
            ],
            [
                // Nobody but the Super Admin can see this one. It is here to
                // prove that Event Admins and Staff only see assigned events.
                'title' => 'Unassigned Demo Event',
                'venue' => 'TBA',
                'status' => EventStatus::Published,
                'starts_at' => now()->addDays(45)->setTime(10, 0),
                'ends_at' => now()->addDays(45)->setTime(15, 0),
                'capacity' => null,
                'admins' => [],
                'staff' => [],
            ],
        ];

        foreach ($events as $data) {
            $admins = $data['admins'];
            $staffMembers = $data['staff'];
            unset($data['admins'], $data['staff']);

            $event = Event::updateOrCreate(
                ['title' => $data['title']],
                $data + ['created_by' => $superAdmin->id]
            );

            foreach ($admins as $user) {
                $event->users()->syncWithoutDetaching([$user->id => ['role' => 'event_admin']]);
            }

            foreach ($staffMembers as $user) {
                $event->users()->syncWithoutDetaching([$user->id => ['role' => 'staff']]);
            }
        }
    }
}