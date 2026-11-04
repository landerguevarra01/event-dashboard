import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { EventStatusBadge } from '@/components/event-status-badge';
import type { UserRole } from '@/types';
import type { EventDetail } from '@/types/event';

type Tab = {
    label: string;
    path: string;
    // Leave out `roles` for tabs every assigned user can see.
    roles?: UserRole[];
};

// Add an entry here as each workspace page is built.
const tabs: Tab[] = [
    { label: 'Overview', path: '' },
    { label: 'Registrations', path: '/registrations' },
    { label: 'Attendees', path: '/attendees' },
    { label: 'Check-in', path: '/check-in' },
    { label: 'Live', path: '/live' },
    {
        label: 'Information',
        path: '/information',
        roles: ['super_admin', 'event_admin'],
    },
    {
        label: 'Operations',
        path: '/operations',
        roles: ['super_admin', 'event_admin'],
    },
    {
        label: 'Review',
        path: '/review-attendance',
        roles: ['super_admin', 'event_admin'],
    },
];

function formatRange(start: string | null, end: string | null): string {
    if (!start) {
        return 'Date not set';
    }

    const format = (value: string) =>
        new Date(value).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });

    return end ? `${format(start)} - ${format(end)}` : format(start);
}

export function EventWorkspaceShell({
    event,
    children,
}: {
    event: EventDetail;
    children: ReactNode;
}) {
    const { url, props } = usePage();
    const role = props.auth.user.role;
    const currentPath = url.split('?')[0];
    const base = `/events/${event.slug}`;

    const visibleTabs = tabs.filter(
        (tab) => !tab.roles || tab.roles.includes(role),
    );

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <div>
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-xl font-semibold">{event.title}</h1>
                    <EventStatusBadge
                        status={event.status}
                        label={event.statusLabel}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    {event.venue ?? 'Venue TBA'} ·{' '}
                    {formatRange(event.startsAt, event.endsAt)}
                </p>
            </div>

            <nav className="flex gap-1 overflow-x-auto border-b border-sidebar-border/70 dark:border-sidebar-border">
                {visibleTabs.map((tab) => {
                    const href = `${base}${tab.path}`;
                    const active =
                        tab.path === ''
                            ? currentPath === base
                            : currentPath.startsWith(href);

                    return (
                        <Link
                            key={tab.label}
                            href={href}
                            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${
                                active
                                    ? 'border-foreground text-foreground'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    );
                })}
            </nav>

            {children}
        </div>
    );
}
