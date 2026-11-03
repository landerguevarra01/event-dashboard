<?php

namespace App\Http\Controllers\Event;

use App\Actions\Attendee\CheckInAttendee;
use App\Http\Controllers\Controller;
use App\Models\Attendee;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    public function index(Event $event): Response
    {
        /** @var Collection<int, Attendee> $attendees */
        $attendees = $event->attendees()->orderBy('name')->get();

        /** @var Collection<int, Attendee> $recent */
        $recent = $event->attendees()
            ->whereNotNull('checked_in_at')
            ->orderByDesc('checked_in_at')
            ->limit(8)
            ->get();

        return Inertia::render('events/check-in', [
            'event' => $event->toWorkspaceItem(),
            // Light shape for the manual search list. No QR tokens are sent here.
            'attendees' => $attendees->map(fn (Attendee $attendee) => [
                'id' => $attendee->id,
                'name' => $attendee->name,
                'email' => $attendee->email,
                'organization' => $attendee->organization,
                'checkedIn' => $attendee->isCheckedIn(),
                'checkedInAt' => $attendee->checked_in_at?->toIso8601String(),
            ])->values(),
            'recent' => $recent->map(fn (Attendee $attendee) => [
                'id' => $attendee->id,
                'name' => $attendee->name,
                'organization' => $attendee->organization,
                'checkedInAt' => $attendee->checked_in_at?->toIso8601String(),
            ])->values(),
            'counts' => $this->counts($event),
        ]);
    }

    /**
     * Called by the camera scanner with the token read from a QR code.
     * Returns JSON so the scanner keeps running without a page reload.
     */
    public function scan(Request $request, Event $event, CheckInAttendee $checkIn): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'max:255'],
        ]);

        // A validation failure becomes a 422 JSON response with errors.token.
        $result = $checkIn->byToken($event, $data['token'], $request->user());

        return response()->json([
            'status' => $result['status'],
            'attendee' => [
                'id' => $result['attendee']->id,
                'name' => $result['attendee']->name,
                'organization' => $result['attendee']->organization,
                'checkedInAt' => $result['attendee']->checked_in_at?->toIso8601String(),
            ],
            'counts' => $this->counts($event),
        ]);
    }

    /**
     * Manual check-in from the search list, for people who can't show a QR code.
     */
    public function store(
        Request $request,
        Event $event,
        Attendee $attendee,
        CheckInAttendee $checkIn,
    ): RedirectResponse {
        // {attendee} is looked up by id, so make sure it belongs to this event.
        abort_unless($attendee->event_id === $event->id, 404);

        $checkIn->byAttendee($event, $attendee, $request->user());

        return back();
    }

    /**
     * @return array{total: int, checkedIn: int}
     */
    private function counts(Event $event): array
    {
        return [
            'total' => $event->attendees()->count(),
            'checkedIn' => $event->attendees()->whereNotNull('checked_in_at')->count(),
        ];
    }
}