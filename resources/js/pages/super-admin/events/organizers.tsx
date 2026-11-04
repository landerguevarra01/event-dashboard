import { Head, Link, router } from '@inertiajs/react';
import { EventStatusBadge } from '@/components/event-status-badge';
import { Button } from '@/components/ui/button';
import type { EventStatus } from '@/types/event';

type EventSummary = {
    id: number;
    title: string;
    slug: string;
    status: EventStatus;
    statusLabel: string;
};

type Person = {
    id: number;
    name: string;
    email: string;
    role: string;
};

const roleLabels: Record<string, string> = {
    event_admin: 'Event Admin',
    staff: 'Staff',
};

const panelClass =
    'rounded-xl border border-sidebar-border/70 dark:border-sidebar-border';

function PersonRow({
    person,
    action,
}: {
    person: Person;
    action: React.ReactNode;
}) {
    return (
        <li className="flex items-center justify-between gap-4 border-b border-sidebar-border/70 px-4 py-3 last:border-0 dark:border-sidebar-border">
            <div>
                <p className="text-sm font-medium">{person.name}</p>
                <p className="text-sm text-muted-foreground">
                    {person.email} · {roleLabels[person.role] ?? person.role}
                </p>
            </div>
            {action}
        </li>
    );
}

export default function EventOrganizers({
    event,
    assigned,
    available,
}: {
    event: EventSummary;
    assigned: Person[];
    available: Person[];
}) {
    const base = `/super-admin/events/${event.slug}/organizers`;

    function assign(person: Person) {
        router.post(base, { user_id: person.id }, { preserveScroll: true });
    }

    function remove(person: Person) {
        router.delete(`${base}/${person.id}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Organizers: ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold">
                                Assign Organizers & Roles
                            </h1>
                            <EventStatusBadge
                                status={event.status}
                                label={event.statusLabel}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {event.title}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/super-admin/events">
                                Back to events
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link
                                href={`/super-admin/events/${event.slug}/registration`}
                            >
                                Next: Registration
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className={panelClass}>
                        <h2 className="border-b border-sidebar-border/70 px-4 py-3 text-sm font-semibold dark:border-sidebar-border">
                            Assigned ({assigned.length})
                        </h2>
                        {assigned.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                Nobody is assigned to this event yet.
                            </p>
                        ) : (
                            <ul>
                                {assigned.map((person) => (
                                    <PersonRow
                                        key={person.id}
                                        person={person}
                                        action={
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => remove(person)}
                                            >
                                                Remove
                                            </Button>
                                        }
                                    />
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className={panelClass}>
                        <h2 className="border-b border-sidebar-border/70 px-4 py-3 text-sm font-semibold dark:border-sidebar-border">
                            Available ({available.length})
                        </h2>
                        {available.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                Everyone who can be assigned is already on this
                                event.
                            </p>
                        ) : (
                            <ul>
                                {available.map((person) => (
                                    <PersonRow
                                        key={person.id}
                                        person={person}
                                        action={
                                            <Button
                                                size="sm"
                                                onClick={() => assign(person)}
                                            >
                                                Assign
                                            </Button>
                                        }
                                    />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

EventOrganizers.layout = {
    breadcrumbs: [
        {
            title: 'All Events',
            href: '/super-admin/events',
        },
        {
            title: 'Organizers',
            href: '#',
        },
    ],
};
