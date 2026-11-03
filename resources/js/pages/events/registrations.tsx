import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { EventWorkspaceShell } from "@/components/event-workspace-shell";
import { Button } from "@/components/ui/button";
import type { EventDetail } from "@/types/event";

type RegistrationStatus = "pending" | "approved" | "rejected" | "cancelled";

type RegistrationRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    notes: string | null;
    status: RegistrationStatus;
    statusLabel: string;
    registeredAt: string | null;
    reviewedAt: string | null;
};

type Counts = Record<RegistrationStatus, number>;

const statusStyles: Record<RegistrationStatus, string> = {
    pending:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    approved:
        "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    cancelled:
        "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

const filters: { label: string; value: RegistrationStatus | "all" }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
];

const panelClass =
    "rounded-xl border border-sidebar-border/70 dark:border-sidebar-border";

function formatDate(value: string | null): string {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className={`${panelClass} p-4`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

export default function Registrations({
    event,
    registrations,
    counts,
    attendeeCount,
}: {
    event: EventDetail;
    registrations: RegistrationRow[];
    counts: Counts;
    attendeeCount: number;
}) {
    const [filter, setFilter] = useState<RegistrationStatus | "all">("all");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const closed = event.status === "completed" || event.status === "archived";
    const visible =
        filter === "all"
            ? registrations
            : registrations.filter((row) => row.status === filter);

    function review(row: RegistrationRow, action: "approve" | "reject") {
        router.post(
            `/events/${event.slug}/registrations/${row.id}/${action}`,
            {},
            {
                preserveScroll: true,
                onStart: () => {
                    setBusyId(row.id);
                    setError(null);
                },
                onError: (errors) => setError(errors.registration ?? null),
                onFinish: () => setBusyId(null),
            },
        );
    }

    return (
        <>
            <Head title={`Registrations: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        label="Pending review"
                        value={counts.pending.toString()}
                    />
                    <SummaryCard
                        label="Approved"
                        value={counts.approved.toString()}
                    />
                    <SummaryCard
                        label="Rejected / cancelled"
                        value={(counts.rejected + counts.cancelled).toString()}
                    />
                    <SummaryCard
                        label="Attendees / capacity"
                        value={`${attendeeCount} / ${event.capacity ?? "Unlimited"}`}
                    />
                </div>

                {closed && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        This event is {event.statusLabel.toLowerCase()}, so
                        registrations can no longer be changed.
                    </p>
                )}

                {error && (
                    <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                        {error}
                    </p>
                )}

                <div className="flex flex-wrap gap-2">
                    {filters.map((item) => (
                        <Button
                            key={item.value}
                            size="sm"
                            variant={
                                filter === item.value ? "default" : "outline"
                            }
                            onClick={() => setFilter(item.value)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                <div className={`${panelClass} overflow-hidden`}>
                    {visible.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground">
                            No registrations to show.
                        </p>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-sidebar-border/70 bg-muted/40 text-muted-foreground dark:border-sidebar-border">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Organization
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Registered
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-sidebar-border/70 last:border-0 dark:border-sidebar-border"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {row.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {row.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.organization ?? "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {formatDate(row.registeredAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}
                                            >
                                                {row.statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {row.status === "pending" &&
                                            !closed ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        disabled={
                                                            busyId === row.id
                                                        }
                                                        onClick={() =>
                                                            review(
                                                                row,
                                                                "approve",
                                                            )
                                                        }
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={
                                                            busyId === row.id
                                                        }
                                                        onClick={() =>
                                                            review(
                                                                row,
                                                                "reject",
                                                            )
                                                        }
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    {row.reviewedAt
                                                        ? `Reviewed ${formatDate(row.reviewedAt)}`
                                                        : "-"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </EventWorkspaceShell>
        </>
    );
}

Registrations.layout = {
    breadcrumbs: [
        {
            title: "Event Workspace",
            href: "#",
        },
        {
            title: "Registrations",
            href: "#",
        },
    ],
};
