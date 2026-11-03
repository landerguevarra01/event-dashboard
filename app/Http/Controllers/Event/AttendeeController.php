<?php

namespace App\Http\Controllers\Event;

use App\Actions\Attendee\AddWalkInAttendee;
use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreAttendeeRequest;
use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AttendeeController extends Controller
{
    public function index(Event $event): Response
    {
        /** @var Collection<int, Attendee> $rows */
        $rows = $event->attendees()->orderBy('name')->get();

        return Inertia::render('events/attendees', [
            'event' => $event->toWorkspaceItem(),
            'attendees' => $rows
                ->map(fn (Attendee $attendee) => $attendee->toListItem())
                ->values(),
            'counts' => [
                'total' => $rows->count(),
                'checkedIn' => $rows->filter(fn (Attendee $attendee) => $attendee->isCheckedIn())->count(),
            ],
        ]);
    }

    public function store(
        StoreAttendeeRequest $request,
        Event $event,
        AddWalkInAttendee $addWalkInAttendee,
    ): RedirectResponse {
        // Throws a validation error (shown on the page) if the event is full or closed.
        $addWalkInAttendee->handle($event, $request->validated());

        return back();
    }
}