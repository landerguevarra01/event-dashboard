<?php

namespace App\Http\Controllers\Event;

use App\Actions\Registration\ApproveRegistration;
use App\Actions\Registration\RejectRegistration;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Registration;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function index(Event $event): Response
    {
        /** @var Collection<int, Registration> $rows */
        $rows = $event->registrations()->latest()->get();

        $byStatus = $rows->countBy(fn (Registration $registration) => $registration->status->value);

        return Inertia::render('events/registrations', [
            'event' => $event->toWorkspaceItem(),
            'registrations' => $rows
                ->map(fn (Registration $registration) => $registration->toListItem())
                ->values(),
            'counts' => [
                'pending' => $byStatus->get('pending', 0),
                'approved' => $byStatus->get('approved', 0),
                'rejected' => $byStatus->get('rejected', 0),
                'cancelled' => $byStatus->get('cancelled', 0),
            ],
            'attendeeCount' => $event->attendees()->count(),
        ]);
    }

    public function approve(
        Request $request,
        Event $event,
        Registration $registration,
        ApproveRegistration $approveRegistration,
    ): RedirectResponse {
        $this->ensureBelongsToEvent($event, $registration);

        // Throws a validation error (shown on the page) if it can't be approved.
        $approveRegistration->handle($registration, $request->user());

        return back();
    }

    public function reject(
        Request $request,
        Event $event,
        Registration $registration,
        RejectRegistration $rejectRegistration,
    ): RedirectResponse {
        $this->ensureBelongsToEvent($event, $registration);

        $rejectRegistration->handle($registration, $request->user());

        return back();
    }

    /**
     * The route only checks access to the event in the URL, so make sure the
     * registration really belongs to it. Otherwise someone assigned to one
     * event could approve registrations of another by changing the id.
     */
    private function ensureBelongsToEvent(Event $event, Registration $registration): void
    {
        abort_unless($registration->event_id === $event->id, 404);
    }
}
