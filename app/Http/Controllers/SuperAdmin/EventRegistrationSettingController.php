<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Event\UpdateRegistrationSettingsRequest;
use App\Models\Event;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventRegistrationSettingController extends Controller
{
    public function edit(Event $event): Response
    {
        return Inertia::render('super-admin/events/registration-settings', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'status' => $event->status->value,
                'statusLabel' => $event->status->label(),
            ],
            'settings' => [
                'registration_enabled' => $event->registration_enabled,
                // Format matches <input type="datetime-local">
                'registration_opens_at' => $event->registration_opens_at?->format('Y-m-d\TH:i'),
                'registration_closes_at' => $event->registration_closes_at?->format('Y-m-d\TH:i'),
                'capacity' => $event->capacity,
            ],
        ]);
    }

    public function update(UpdateRegistrationSettingsRequest $request, Event $event): RedirectResponse
    {
        $event->update($request->validated());

        return redirect()->route('super-admin.events.registration.edit', $event);
    }
}
