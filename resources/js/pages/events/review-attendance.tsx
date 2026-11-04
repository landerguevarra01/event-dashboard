import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import { Button } from '@/components/ui/button';
import type { EventDetail } from '@/types/event';

type Summary = {
    total: number;
    checkedIn: number;
    noShows: number;
    walkIns: number;
    rate: number;
};

type OrganizationRow = {
    organization: string;
    total: number;
    checkedIn: number;
};

type NoShow = {
    id: number;
    name: string;
    email: string | null;
    organization: string | null;
    source: 'registration' | 'walk-in';
};

const panelClass =
    'rounded-xl border border-sidebar-border/70 dark:border-sidebar-border';

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

function percent(part: number, whole: number): number {
    return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
                className="h-full rounded-full bg-green-500"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

function SummaryCard({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint?: string;
}) {
    return (
        <div className={`${panelClass} p-4`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
            {hint && (
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            )}
        </div>
    );
}

export default function ReviewAttendance({
    event,
    reviewedBy,
    changedSinceReview,
    pendingRegistrations,
    summary,
    byOrganization,
    noShowList,
}: {
    event: EventDetail;
    reviewedBy: string | null;
    changedSinceReview: boolean;
    pendingRegistrations: number;
    summary: Summary;
    byOrganization: OrganizationRow[];
    noShowList: NoShow[];
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base = `/events/${event.slug}`;
    const reviewed = event.attendanceReviewedAt !== null;
    const canConfirm = event.status === 'ongoing';

    function confirm() {
        router.post(
            `${base}/review-attendance/confirm`,
            {},
            {
                preserveScroll: true,
                onStart: () => {
                    setBusy(true);
                    setError(null);
                },
                onError: (errors) => setError(errors.operation ?? null),
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <>
            <Head title={`Review attendance: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        label="Attendees"
                        value={summary.total.toString()}
                    />
                    <SummaryCard
                        label="Checked in"
                        value={summary.checkedIn.toString()}
                        hint={`${summary.rate}% attendance`}
                    />
                    <SummaryCard
                        label="No-shows"
                        value={summary.noShows.toString()}
                    />
                    <SummaryCard
                        label="Walk-ins"
                        value={summary.walkIns.toString()}
                        hint="Added at the door"
                    />
                </div>

                {error && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </p>
                )}

                {changedSinceReview && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        Someone checked in after this attendance was confirmed.
                        Confirm it again to bring the review up to date. The
                        event can't be completed until you do.
                    </p>
                )}

                {pendingRegistrations > 0 && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        {pendingRegistrations} registration
                        {pendingRegistrations === 1 ? ' is' : 's are'} still
                        pending and not counted here.{' '}
                        <Link
                            href={`${base}/registrations`}
                            className="underline"
                        >
                            Review registrations
                        </Link>
                    </p>
                )}

                <section
                    className={`${panelClass} flex flex-wrap items-center justify-between gap-4 p-5`}
                >
                    <div>
                        <h2 className="font-semibold">Confirm attendance</h2>
                        <p className="text-sm text-muted-foreground">
                            {reviewed
                                ? `Confirmed ${formatDate(event.attendanceReviewedAt)}${reviewedBy ? ` by ${reviewedBy}` : ''}.`
                                : 'Not confirmed yet.'}
                        </p>
                        {!canConfirm && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Attendance can only be confirmed while the event
                                is ongoing.
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`${base}/operations`}>
                                Back to operations
                            </Link>
                        </Button>
                        <Button
                            disabled={busy || !canConfirm}
                            onClick={confirm}
                        >
                            {reviewed ? 'Confirm again' : 'Confirm attendance'}
                        </Button>
                    </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-2">
                    <section className={panelClass}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            By organization
                        </h2>
                        {byOrganization.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                No attendees.
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
                                                {row.checkedIn} / {row.total} (
                                                {percent(
                                                    row.checkedIn,
                                                    row.total,
                                                )}
                                                %)
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

                    <section className={panelClass}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            No-shows ({noShowList.length})
                        </h2>
                        {noShowList.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                Everyone who was expected checked in.
                            </p>
                        ) : (
                            <ul className="max-h-96 overflow-y-auto">
                                {noShowList.map((person) => (
                                    <li
                                        key={person.id}
                                        className="flex items-center justify-between gap-3 border-b border-sidebar-border/70 px-5 py-3 text-sm last:border-0 dark:border-sidebar-border"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {person.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {person.organization ??
                                                    person.email ??
                                                    '-'}
                                            </p>
                                        </div>
                                        <span className="text-muted-foreground">
                                            {person.source === 'walk-in'
                                                ? 'Walk-in'
                                                : 'Registered'}
                                        </span>
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

ReviewAttendance.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
        {
            title: 'Review attendance',
            href: '#',
        },
    ],
};
