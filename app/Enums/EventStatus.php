<?php

namespace App\Enums;

enum EventStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Ongoing = 'ongoing';
    case Completed = 'completed';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Published => 'Published',
            self::Ongoing => 'Ongoing',
            self::Completed => 'Completed',
            self::Archived => 'Archived',
        };
    }

    /**
     * Events that are open for registration, check-in, and day-of operations.
     */
    public function isActive(): bool
    {
        return in_array($this, [self::Published, self::Ongoing], true);
    }
}
