<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LiveAttendanceController extends Controller
{
    public function __invoke(Event $event): Response
    {
        /** @var Collection<int, Attendee> $attendees */
        $attendees = $event->attendees()
            ->with('checkedInBy')
            ->orderBy('name')
            ->get();

        $checkedIn = $attendees->filter(fn (Attendee $attendee) => $attendee->isCheckedIn());
        $waiting = $attendees->reject(fn (Attendee $attendee) => $attendee->isCheckedIn());

        $total = $attendees->count();
        $arrived = $checkedIn->count();

        return Inertia::render('events/live-attendance', [
            'event' => $event->toWorkspaceItem(),
            'counts' => [
                'total' => $total,
                'checkedIn' => $arrived,
                'notYet' => $total - $arrived,
            ],
            'byOrganization' => $attendees
                ->groupBy(fn (Attendee $attendee) => $attendee->organization ?? 'No organization')
                ->map(fn ($group, $organization) => [
                    'organization' => (string) $organization,
                    'total' => $group->count(),
                    'checkedIn' => $group
                        ->filter(fn (Attendee $attendee) => $attendee->isCheckedIn())
                        ->count(),
                ])
                ->values(),
            'arrivals' => $checkedIn
                ->sortByDesc(fn (Attendee $attendee) => $attendee->checked_in_at?->getTimestamp() ?? 0)
                ->take(20)
                ->map(fn (Attendee $attendee) => [
                    'id' => $attendee->id,
                    'name' => $attendee->name,
                    'organization' => $attendee->organization,
                    'checkedInAt' => $attendee->checked_in_at?->toIso8601String(),
                    'checkedInBy' => $attendee->checkedInBy?->name,
                ])
                ->values(),
            'notArrived' => $waiting
                ->map(fn (Attendee $attendee) => [
                    'id' => $attendee->id,
                    'name' => $attendee->name,
                    'organization' => $attendee->organization,
                ])
                ->values(),
        ]);
    }
}
