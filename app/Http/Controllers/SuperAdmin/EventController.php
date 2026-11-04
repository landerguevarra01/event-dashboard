<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Actions\Event\PublishEvent;
use App\Enums\EventStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Event\StoreEventRequest;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        /** @var Collection<int, Event> $rows */
        $rows = Event::query()
            ->withCount('users')
            ->orderByDesc('starts_at')
            ->get();

        return Inertia::render('super-admin/events/index', [
            'events' => $rows->map(fn (Event $event) => $event->toListItem()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('super-admin/events/create');
    }

    public function store(StoreEventRequest $request): RedirectResponse
    {
        $event = Event::create([
            ...$request->validated(),
            'status' => EventStatus::Draft,
            'created_by' => $request->user()->id,
        ]);

        // Next step of the wizard: Assign Organizers & Roles.
        return redirect()->route('super-admin.events.organizers.edit', $event);
    }

    public function publish(Event $event, PublishEvent $publishEvent): RedirectResponse
    {
        // Throws a validation error (shown on the page) if the event isn't ready.
        $publishEvent->handle($event);

        return redirect()->route('super-admin.events.index');
    }
}
