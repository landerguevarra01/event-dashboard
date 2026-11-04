export type EventStatus =
    | 'draft'
    | 'published'
    | 'ongoing'
    | 'completed'
    | 'archived';

// Row shape used in event lists.
export type EventRow = {
    id: number;
    title: string;
    slug: string;
    venue: string | null;
    status: EventStatus;
    statusLabel: string;
    startsAt: string | null;
    capacity: number | null;
    teamCount: number;
};

// Full shape used inside the event workspace.
export type EventDetail = {
    id: number;
    title: string;
    slug: string;
    description: string | null;
    venue: string | null;
    status: EventStatus;
    statusLabel: string;
    startsAt: string | null;
    endsAt: string | null;
    capacity: number | null;
    registrationEnabled: boolean;
    registrationOpensAt: string | null;
    registrationClosesAt: string | null;
    attendanceReviewedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    archivedAt: string | null;
};
