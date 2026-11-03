<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('super-admin/dashboard', [
            'stats' => [
                'totalUsers' => User::count(),
                'superAdmins' => User::where('role', UserRole::SuperAdmin)->count(),
                'eventAdmins' => User::where('role', UserRole::EventAdmin)->count(),
                'staff' => User::where('role', UserRole::Staff)->count(),
            ],
        ]);
    }
}