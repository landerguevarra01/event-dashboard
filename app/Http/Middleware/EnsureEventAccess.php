<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Event;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureEventAccess
{
    /**
     * Allow the request only if the user is a Super Admin or is assigned
     * to the event in the route.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $event = $request->route('event');

        abort_unless($user && $event instanceof Event, 404);

        if ($user->hasRole(UserRole::SuperAdmin)) {
            return $next($request);
        }

        abort_unless(
            $event->users()->whereKey($user->id)->exists(),
            403,
            'You are not assigned to this event.'
        );

        return $next($request);
    }
}