<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EventOrganizerController extends Controller
{
    public function edit(Event $event): Response
    {
        /** @var Collection<int, User> $assigned */
        $assigned = $event->users()->orderBy('name')->get();

        /** @var Collection<int, User> $available */
        $available = User::query()
            ->whereIn('role', [UserRole::EventAdmin->value, UserRole::Staff->value])
            ->whereNotIn('id', $assigned->pluck('id'))
            ->orderBy('name')
            ->get();

        return Inertia::render('super-admin/events/organizers', [
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'slug' => $event->slug,
                'status' => $event->status->value,
                'statusLabel' => $event->status->label(),
            ],
            'assigned' => $assigned->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->eventRole(),
            ])->values(),
            'available' => $available->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ])->values(),
        ]);
    }

    public function store(Request $request, Event $event): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::findOrFail((int) $data['user_id']);

        abort_unless(
            $user->hasRole(UserRole::EventAdmin, UserRole::Staff),
            422,
            'Only Event Admin and Staff accounts can be assigned to an event.'
        );

        // The per-event role follows the account role.
        $event->users()->syncWithoutDetaching([
            $user->id => ['role' => $user->role->value],
        ]);

        return back();
    }

    public function destroy(Event $event, User $user): RedirectResponse
    {
        $event->users()->detach($user->id);

        return back();
    }
}
