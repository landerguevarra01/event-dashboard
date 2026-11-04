<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var Collection<int, Event> $rows */
        $rows = Event::query()
            ->visibleTo($request->user())
            ->withCount('users')
            ->orderByDesc('starts_at')
            ->get();

        $events = $rows->map(fn (Event $event) => $event->toListItem());

        return Inertia::render('staff/dashboard', [
            'events' => $events,
        ]);
    }
}
