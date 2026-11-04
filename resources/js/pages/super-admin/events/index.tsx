import { Head, Link } from '@inertiajs/react';
import { EventStatusBadge } from '@/components/event-status-badge';
import { Button } from '@/components/ui/button';
import type { EventRow } from '@/types/event';

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export default function EventsIndex({ events }: { events: EventRow[] }) {
    return (
        <>
            <Head title="All Events" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold">All Events</h1>
                        <p className="text-sm text-muted-foreground">
                            Every event in the system, across all statuses.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/super-admin/events/create">
                            Create Event
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    {events.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground">
                            No events yet.
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-muted/40 text-muted-foreground dark:border-sidebar-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Event
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Team
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Capacity
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="border-b border-sidebar-border/70 last:border-0 dark:border-sidebar-border"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/events/${event.slug}`}
                                                className="font-medium hover:underline"
                                            >
                                                {event.title}
                                            </Link>
                                            <p className="text-muted-foreground">
                                                {event.venue ?? 'Venue TBA'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatDate(event.startsAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <EventStatusBadge
                                                status={event.status}
                                                label={event.statusLabel}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {event.teamCount}
                                        </td>
                                        <td className="px-4 py-3">
                                            {event.capacity ?? 'Unlimited'}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link
                                                    href={`/super-admin/events/${event.slug}/organizers`}
                                                >
                                                    Organizers
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Global Dashboard',
            href: '/super-admin/dashboard',
        },
        {
            title: 'All Events',
            href: '/super-admin/events',
        },
    ],
};
