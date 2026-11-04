<?php

namespace App\Enums;

enum UserRole: string
{
    case SuperAdmin = 'super_admin';
    case EventAdmin = 'event_admin';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::SuperAdmin => 'Super Admin',
            self::EventAdmin => 'Event Admin',
            self::Staff => 'Staff',
        };
    }

    public function homeRoute(): string
    {
        return match ($this) {
            self::SuperAdmin => 'super-admin.dashboard',
            self::EventAdmin => 'event-admin.dashboard',
            self::Staff => 'staff.dashboard',
        };
    }
}
