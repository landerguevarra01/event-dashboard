import { Head, Link } from "@inertiajs/react";
import { EventStatusBadge } from "@/components/event-status-badge";
import type { EventRow } from "@/types/event";

const cardClass =
    "rounded-xl border border-sidebar-border/70 p-5 dark:border-sidebar-border";

function formatDate(value: string | null): string {
    if (!value) {
        return "Date not set";
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

export default function StaffDashboard({ events }: { events: EventRow[] }) {
    return (
        <>
            <Head title="Staff Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-xl font-semibold">Staff Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Your assigned events and on-site tasks, such as
                        registrations, attendees, and check-in.
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className={`${cardClass} flex-1`}>
                        <p className="text-sm text-muted-foreground">
                            No assignments yet. Events you are assigned to will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.slug}`}
                                className={`${cardClass} block transition hover:bg-muted/40`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="font-semibold">
                                        {event.title}
                                    </h2>
                                    <EventStatusBadge
                                        status={event.status}
                                        label={event.statusLabel}
                                    />
                                </div>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {event.venue ?? "Venue TBA"}
                                </p>

                                <dl className="mt-4 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            When
                                        </dt>
                                        <dd>{formatDate(event.startsAt)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">
                                            Team
                                        </dt>
                                        <dd>{event.teamCount}</dd>
                                    </div>
                                </dl>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

StaffDashboard.layout = {
    breadcrumbs: [
        {
            title: "Staff Dashboard",
            href: "/staff/dashboard",
        },
    ],
};
