import { Head } from '@inertiajs/react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import type { EventDetail } from '@/types/event';

type TeamMember = {
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

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right">{value}</dd>
        </div>
    );
}

export default function EventOverview({
    event,
    team,
}: {
    event: EventDetail;
    team: TeamMember[];
}) {
    return (
        <>
            <Head title={event.title} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panelClass} p-5 lg:col-span-2`}>
                        <h2 className="text-sm font-semibold">
                            About this event
                        </h2>
                        <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">
                            {event.description ?? 'No description yet.'}
                        </p>
                    </section>

                    <section className={`${panelClass} p-5`}>
                        <h2 className="text-sm font-semibold">Registration</h2>
                        <dl className="mt-3 space-y-2">
                            <Detail
                                label="Status"
                                value={
                                    event.registrationEnabled
                                        ? 'Open'
                                        : 'Closed'
                                }
                            />
                            <Detail
                                label="Opens"
                                value={formatDate(event.registrationOpensAt)}
                            />
                            <Detail
                                label="Closes"
                                value={formatDate(event.registrationClosesAt)}
                            />
                            <Detail
                                label="Capacity"
                                value={
                                    event.capacity?.toString() ?? 'Unlimited'
                                }
                            />
                        </dl>
                    </section>
                </div>

                <section className={panelClass}>
                    <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                        Team ({team.length})
                    </h2>
                    {team.length === 0 ? (
                        <p className="p-5 text-sm text-muted-foreground">
                            Nobody is assigned to this event yet.
                        </p>
                    ) : (
                        <ul>
                            {team.map((member) => (
                                <li
                                    key={member.id}
                                    className="flex items-center justify-between gap-4 border-b border-sidebar-border/70 px-5 py-3 last:border-0 dark:border-sidebar-border"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {member.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.email}
                                        </p>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {roleLabels[member.role] ?? member.role}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </EventWorkspaceShell>
        </>
    );
}

EventOverview.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
    ],
};
