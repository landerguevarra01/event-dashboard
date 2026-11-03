<?php

namespace App\Http\Controllers\Event;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function __invoke(Event $event): Response
    {
        /** @var Collection<int, User> $team */
        $team = $event->users()->orderBy('name')->get();

        return Inertia::render('events/overview', [
            'event' => $event->toWorkspaceItem(),
            'team' => $team->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->pivot->role,
            ])->values(),
        ]);
    }
}