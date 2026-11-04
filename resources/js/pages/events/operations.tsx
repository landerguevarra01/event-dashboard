import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import { Button } from '@/components/ui/button';
import type { EventDetail } from '@/types/event';

type Counts = {
    total: number;
    checkedIn: number;
    pendingRegistrations: number;
};

type StepState = 'done' | 'current' | 'upcoming';

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

const stepStyles: Record<StepState, string> = {
    done: 'border-green-500 bg-green-500 text-white',
    current: 'border-foreground bg-foreground text-background',
    upcoming: 'border-input text-muted-foreground',
};

function Step({
    number,
    label,
    state,
    at,
}: {
    number: number;
    label: string;
    state: StepState;
    at?: string | null;
}) {
    return (
        <li className="flex items-center gap-3">
            <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium ${stepStyles[state]}`}
            >
                {state === 'done' ? '✓' : number}
            </span>
            <div>
                <p
                    className={`text-sm font-medium ${state === 'upcoming' ? 'text-muted-foreground' : ''}`}
                >
                    {label}
                </p>
                {at && (
                    <p className="text-xs text-muted-foreground">
                        {formatDate(at)}
                    </p>
                )}
            </div>
        </li>
    );
}

function ActionCard({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`${panelClass} space-y-3 p-5`}>
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}

export default function Operations({
    event,
    reviewedBy,
    counts,
}: {
    event: EventDetail;
    reviewedBy: string | null;
    counts: Counts;
}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const base = `/events/${event.slug}`;
    const status = event.status;
    const reviewed = event.attendanceReviewedAt !== null;

    // Each lifecycle button posts to its own route. The server re-checks the
    // rules, so the message below is whatever it refuses with.
    function post(
        action: 'start' | 'complete' | 'archive',
        confirmText?: string,
    ) {
        if (confirmText && !window.confirm(confirmText)) {
            return;
        }

        router.post(
            `${base}/operations/${action}`,
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

    const steps: { label: string; state: StepState; at?: string | null }[] = [
        {
            label: 'Published',
            state: status === 'draft' ? 'upcoming' : 'done',
        },
        {
            label: 'Event started',
            state:
                status === 'published'
                    ? 'current'
                    : status === 'draft'
                      ? 'upcoming'
                      : 'done',
            at: event.startedAt,
        },
        {
            label: 'Attendance reviewed',
            state:
                reviewed && (status === 'completed' || status === 'archived')
                    ? 'done'
                    : status === 'ongoing'
                      ? reviewed
                          ? 'done'
                          : 'current'
                      : 'upcoming',
            at: event.attendanceReviewedAt,
        },
        {
            label: 'Marked as completed',
            state:
                status === 'completed' || status === 'archived'
                    ? 'done'
                    : status === 'ongoing' && reviewed
                      ? 'current'
                      : 'upcoming',
            at: event.completedAt,
        },
        {
            label: 'Archived',
            state:
                status === 'archived'
                    ? 'done'
                    : status === 'completed'
                      ? 'current'
                      : 'upcoming',
            at: event.archivedAt,
        },
    ];

    return (
        <>
            <Head title={`Operations: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className={`${panelClass} p-4`}>
                        <p className="text-sm text-muted-foreground">
                            Checked in
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {counts.checkedIn} / {counts.total}
                        </p>
                    </div>
                    <div className={`${panelClass} p-4`}>
                        <p className="text-sm text-muted-foreground">
                            Registrations awaiting review
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {counts.pendingRegistrations}
                        </p>
                    </div>
                    <div className={`${panelClass} p-4`}>
                        <p className="text-sm text-muted-foreground">
                            Quick links
                        </p>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            <Link
                                href={`${base}/check-in`}
                                className="underline"
                            >
                                Check-in
                            </Link>
                            <Link href={`${base}/live`} className="underline">
                                Live attendance
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </p>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panelClass} p-5 lg:col-span-1`}>
                        <h2 className="mb-4 text-sm font-semibold">
                            Event progress
                        </h2>
                        <ol className="space-y-4">
                            {steps.map((step, index) => (
                                <Step
                                    key={step.label}
                                    number={index + 1}
                                    label={step.label}
                                    state={step.state}
                                    at={step.at}
                                />
                            ))}
                        </ol>
                    </section>

                    <section className="space-y-4 lg:col-span-2">
                        {status === 'draft' && (
                            <ActionCard
                                title="This event is still a draft"
                                description="Publish it from the registration settings page before it can start."
                            >
                                <p className="text-sm text-muted-foreground">
                                    Only a Super Admin can open that page.
                                </p>
                            </ActionCard>
                        )}

                        {status === 'published' && (
                            <ActionCard
                                title="Start the event"
                                description="Marks the event as ongoing. You can then review attendance and complete it."
                            >
                                <Button
                                    disabled={busy}
                                    onClick={() =>
                                        post(
                                            'start',
                                            'Start this event now? It will be marked as ongoing.',
                                        )
                                    }
                                >
                                    Start event
                                </Button>
                            </ActionCard>
                        )}

                        {status === 'ongoing' && (
                            <>
                                <ActionCard
                                    title="Review attendance"
                                    description="Check the final numbers and confirm them before closing the event."
                                >
                                    <p className="text-sm text-muted-foreground">
                                        {reviewed
                                            ? `Confirmed ${formatDate(event.attendanceReviewedAt)}${reviewedBy ? ` by ${reviewedBy}` : ''}.`
                                            : 'Not confirmed yet.'}
                                    </p>
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`${base}/review-attendance`}
                                        >
                                            {reviewed
                                                ? 'Open attendance review'
                                                : 'Review attendance'}
                                        </Link>
                                    </Button>
                                </ActionCard>

                                <ActionCard
                                    title="Mark as completed"
                                    description="Closes check-in and registration for good. Attendance must be reviewed first."
                                >
                                    {counts.pendingRegistrations > 0 && (
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            {counts.pendingRegistrations}{' '}
                                            registration
                                            {counts.pendingRegistrations === 1
                                                ? ' is'
                                                : 's are'}{' '}
                                            still pending. They stay unreviewed
                                            once the event is completed.
                                        </p>
                                    )}
                                    <Button
                                        disabled={busy || !reviewed}
                                        onClick={() =>
                                            post(
                                                'complete',
                                                'Mark this event as completed? Check-in and registration will close.',
                                            )
                                        }
                                    >
                                        Mark as completed
                                    </Button>
                                    {!reviewed && (
                                        <p className="text-sm text-muted-foreground">
                                            Review the attendance first to
                                            enable this.
                                        </p>
                                    )}
                                </ActionCard>
                            </>
                        )}

                        {status === 'completed' && (
                            <ActionCard
                                title="Archive the event"
                                description="Archived events become read-only. Everything stays on record."
                            >
                                <Button
                                    disabled={busy}
                                    onClick={() =>
                                        post(
                                            'archive',
                                            'Archive this event? It will become read-only.',
                                        )
                                    }
                                >
                                    Archive event
                                </Button>
                            </ActionCard>
                        )}

                        {status === 'archived' && (
                            <ActionCard
                                title="This event is archived"
                                description="It is read-only. Its attendance data is still available."
                            >
                                <Button variant="outline" asChild>
                                    <Link href={`${base}/review-attendance`}>
                                        View attendance summary
                                    </Link>
                                </Button>
                            </ActionCard>
                        )}
                    </section>
                </div>
            </EventWorkspaceShell>
        </>
    );
}

Operations.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
        {
            title: 'Operations',
            href: '#',
        },
    ],
};
