<?php

namespace App\Http\Controllers\Event;

use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Event\UpdateEventRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class InformationController extends Controller
{
    public function edit(Event $event): Response
    {
        return Inertia::render('events/information', [
            'event' => $event->toWorkspaceItem(),
            'form' => [
                'title' => $event->title,
                'venue' => $event->venue,
                'description' => $event->description,
                // Format matches <input type="datetime-local">
                'starts_at' => $event->starts_at?->format('Y-m-d\TH:i'),
                'ends_at' => $event->ends_at?->format('Y-m-d\TH:i'),
            ],
        ]);
    }

    public function update(UpdateEventRequest $request, Event $event): RedirectResponse
    {
        abort_if(
            $event->status === EventStatus::Archived,
            403,
            'Archived events cannot be edited.'
        );

        $event->update($request->validated());

        return back();
    }
}
