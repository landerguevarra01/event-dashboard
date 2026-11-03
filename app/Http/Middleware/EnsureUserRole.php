<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Allow the request only if the user has one of the given roles.
     *
     * Usage: ->middleware('role:super_admin,event_admin')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $allowed = array_map(fn (string $role) => UserRole::from($role), $roles);

        abort_unless(
            $request->user()?->hasRole(...$allowed),
            403,
            'You do not have access to this page.'
        );

        return $next($request);
    }
}