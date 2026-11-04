import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import type { EventDetail } from '@/types/event';

type Counts = {
    total: number;
    checkedIn: number;
    notYet: number;
};

type OrganizationRow = {
    organization: string;
    total: number;
    checkedIn: number;
};

type Arrival = {
    id: number;
    name: string;
    organization: string | null;
    checkedInAt: string | null;
    checkedInBy: string | null;
};

type Waiting = {
    id: number;
    name: string;
    organization: string | null;
};

// How often the page asks the server for fresh numbers.
const REFRESH_MS = 5000;

const panelClass =
    'rounded-xl border border-sidebar-border/70 dark:border-sidebar-border';

function formatTime(value: string | null): string {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function percent(part: number, whole: number): number {
    return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default function LiveAttendance({
    event,
    counts,
    byOrganization,
    arrivals,
    notArrived,
}: {
    event: EventDetail;
    counts: Counts;
    byOrganization: OrganizationRow[];
    arrivals: Arrival[];
    notArrived: Waiting[];
}) {
    const [paused, setPaused] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(() => new Date());

    // Refresh only the changing data, and not while the tab is hidden.
    useEffect(() => {
        if (paused) {
            return;
        }

        const timer = setInterval(() => {
            if (document.hidden) {
                return;
            }

            router.reload({
                only: ['counts', 'byOrganization', 'arrivals', 'notArrived'],
                onSuccess: () => setUpdatedAt(new Date()),
            });
        }, REFRESH_MS);

        return () => clearInterval(timer);
    }, [paused]);

    const arrivedPercent = percent(counts.checkedIn, counts.total);

    return (
        <>
            <Head title={`Live attendance: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {paused
                            ? 'Auto-refresh is paused.'
                            : `Refreshes every ${REFRESH_MS / 1000} seconds. Last updated ${updatedAt.toLocaleTimeString()}.`}
                    </p>
                    <button
                        type="button"
                        onClick={() => setPaused((value) => !value)}
                        className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-muted"
                    >
                        {paused ? 'Resume' : 'Pause'}
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className={`${panelClass} p-5`}>
                        <p className="text-sm text-muted-foreground">
                            Checked in
                        </p>
                        <p className="mt-1 text-4xl font-semibold">
                            {counts.checkedIn}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            of {counts.total} attendees
                        </p>
                    </div>
                    <div className={`${panelClass} p-5`}>
                        <p className="text-sm text-muted-foreground">
                            Still to arrive
                        </p>
                        <p className="mt-1 text-4xl font-semibold">
                            {counts.notYet}
                        </p>
                    </div>
                    <div className={`${panelClass} p-5`}>
                        <p className="text-sm text-muted-foreground">
                            Attendance
                        </p>
                        <p className="mt-1 text-4xl font-semibold">
                            {arrivedPercent}%
                        </p>
                        <div className="mt-3">
                            <ProgressBar value={arrivedPercent} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panelClass} lg:col-span-1`}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            By organization
                        </h2>
                        {byOrganization.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                No attendees yet.
                            </p>
                        ) : (
                            <ul className="space-y-4 p-5">
                                {byOrganization.map((row) => (
                                    <li key={row.organization}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="font-medium">
                                                {row.organization}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {row.checkedIn} / {row.total}
                                            </span>
                                        </div>
                                        <ProgressBar
                                            value={percent(
                                                row.checkedIn,
                                                row.total,
                                            )}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className={`${panelClass} lg:col-span-1`}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            Latest arrivals
                        </h2>
                        {arrivals.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                Nobody has checked in yet.
                            </p>
                        ) : (
                            <ul className="max-h-96 overflow-y-auto">
                                {arrivals.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 border-b border-sidebar-border/70 px-5 py-3 text-sm last:border-0 dark:border-sidebar-border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {item.organization ?? '-'}
                                                {item.checkedInBy
                                                    ? ` · scanned by ${item.checkedInBy}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <span className="text-muted-foreground">
                                            {formatTime(item.checkedInAt)}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className={`${panelClass} lg:col-span-1`}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            Not arrived yet ({notArrived.length})
                        </h2>
                        {notArrived.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                Everyone has arrived.
                            </p>
                        ) : (
                            <ul className="max-h-96 overflow-y-auto">
                                {notArrived.map((item) => (
                                    <li
                                        key={item.id}
                                        className="border-b border-sidebar-border/70 px-5 py-3 text-sm last:border-0 dark:border-sidebar-border"
                                    >
                                        <p className="font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {item.organization ?? '-'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </EventWorkspaceShell>
        </>
    );
}

LiveAttendance.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
        {
            title: 'Live attendance',
            href: '#',
        },
    ],
};
