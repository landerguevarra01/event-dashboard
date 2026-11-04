<?php

namespace App\Http\Controllers\Event;

use App\Actions\Event\ArchiveEvent;
use App\Actions\Event\CompleteEvent;
use App\Actions\Event\ConfirmAttendanceReview;
use App\Actions\Event\StartEvent;
use App\Enums\RegistrationStatus;
use App\Http\Controllers\Controller;
use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    /**
     * Event Operations: where the event is in its lifecycle, and the buttons
     * that move it forward.
     */
    public function show(Event $event): Response
    {
        $event->load('attendanceReviewer');

        return Inertia::render('events/operations', [
            'event' => $event->toWorkspaceItem(),
            'reviewedBy' => $event->attendanceReviewer?->name,
            'counts' => $this->counts($event),
        ]);
    }

    /**
     * Review Attendance: the numbers an admin confirms before completing.
     */
    public function review(Event $event): Response
    {
        $event->load('attendanceReviewer');

        /** @var Collection<int, Attendee> $attendees */
        $attendees = $event->attendees()->orderBy('name')->get();

        $checkedIn = $attendees->filter(fn (Attendee $attendee) => $attendee->isCheckedIn());
        $noShows = $attendees->reject(fn (Attendee $attendee) => $attendee->isCheckedIn());
        $walkIns = $attendees->filter(fn (Attendee $attendee) => $attendee->registration_id === null);

        $total = $attendees->count();
        $arrived = $checkedIn->count();
        $reviewedAt = $event->attendance_reviewed_at;

        // Same rule as CompleteEvent: a check-in after the review makes the
        // confirmed numbers out of date.
        $changedSinceReview = $reviewedAt !== null
            && $checkedIn->contains(
                fn (Attendee $attendee) => $attendee->checked_in_at !== null
                    && $attendee->checked_in_at->greaterThan($reviewedAt)
            );

        return Inertia::render('events/review-attendance', [
            'event' => $event->toWorkspaceItem(),
            'reviewedBy' => $event->attendanceReviewer?->name,
            'changedSinceReview' => $changedSinceReview,
            'pendingRegistrations' => $this->pendingRegistrations($event),
            'summary' => [
                'total' => $total,
                'checkedIn' => $arrived,
                'noShows' => $noShows->count(),
                'walkIns' => $walkIns->count(),
                'rate' => $total === 0 ? 0 : (int) round(($arrived / $total) * 100),
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
            'noShowList' => $noShows
                ->map(fn (Attendee $attendee) => [
                    'id' => $attendee->id,
                    'name' => $attendee->name,
                    'email' => $attendee->email,
                    'organization' => $attendee->organization,
                    'source' => $attendee->registration_id === null ? 'walk-in' : 'registration',
                ])
                ->values(),
        ]);
    }

    public function start(Event $event, StartEvent $startEvent): RedirectResponse
    {
        // Each action throws a validation error (shown on the page) if the
        // event isn't in the right state.
        $startEvent->handle($event);

        return back();
    }

    public function confirmReview(
        Request $request,
        Event $event,
        ConfirmAttendanceReview $confirmAttendanceReview,
    ): RedirectResponse {
        $confirmAttendanceReview->handle($event, $request->user());

        return back();
    }

    public function complete(Event $event, CompleteEvent $completeEvent): RedirectResponse
    {
        $completeEvent->handle($event);

        return back();
    }

    public function archive(Event $event, ArchiveEvent $archiveEvent): RedirectResponse
    {
        $archiveEvent->handle($event);

        return back();
    }

    /**
     * @return array{total: int, checkedIn: int, pendingRegistrations: int}
     */
    private function counts(Event $event): array
    {
        return [
            'total' => $event->attendees()->count(),
            'checkedIn' => $event->attendees()->whereNotNull('checked_in_at')->count(),
            'pendingRegistrations' => $this->pendingRegistrations($event),
        ];
    }

    private function pendingRegistrations(Event $event): int
    {
        return $event->registrations()
            ->where('status', RegistrationStatus::Pending->value)
            ->count();
    }
}
