import { Head, useForm } from "@inertiajs/react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import type { FormEvent } from "react";
import { EventWorkspaceShell } from "@/components/event-workspace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventDetail } from "@/types/event";

type AttendeeRow = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    organization: string | null;
    source: "registration" | "walk-in";
    qrToken: string;
    checkedIn: boolean;
    checkedInAt: string | null;
};

type Counts = {
    total: number;
    checkedIn: number;
};

const panelClass =
    "rounded-xl border border-sidebar-border/70 dark:border-sidebar-border";

function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
        <div className={`${panelClass} p-4`}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}

function QrDialog({
    attendee,
    onClose,
}: {
    attendee: AttendeeRow;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xs rounded-xl bg-background p-6 text-center shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="font-semibold">{attendee.name}</p>
                <p className="text-sm text-muted-foreground">
                    {attendee.organization ?? "No organization"}
                </p>

                {/* White background keeps the code scannable in dark mode. */}
                <div className="mx-auto mt-4 w-fit rounded-lg bg-white p-3">
                    <QRCodeSVG value={attendee.qrToken} size={200} />
                </div>

                <Button
                    className="mt-5 w-full"
                    variant="outline"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        </div>
    );
}

export default function Attendees({
    event,
    attendees,
    counts,
}: {
    event: EventDetail;
    attendees: AttendeeRow[];
    counts: Counts;
}) {
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [qrFor, setQrFor] = useState<AttendeeRow | null>(null);

    const form = useForm({
        name: "",
        email: "",
        phone: "",
        organization: "",
    });

    const closed = event.status === "completed" || event.status === "archived";
    const actionError = (form.errors as Record<string, string | undefined>)
        .attendee;

    const query = search.trim().toLowerCase();
    const visible = query
        ? attendees.filter((attendee) =>
              [attendee.name, attendee.email, attendee.organization]
                  .filter(Boolean)
                  .some((value) => value!.toLowerCase().includes(query)),
          )
        : attendees;

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post(`/events/${event.slug}/attendees`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    }

    return (
        <>
            <Head title={`Attendees: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 sm:grid-cols-3">
                    <SummaryCard
                        label="Attendees"
                        value={counts.total.toString()}
                    />
                    <SummaryCard
                        label="Checked in"
                        value={`${counts.checkedIn} / ${counts.total}`}
                    />
                    <SummaryCard
                        label="Capacity"
                        value={event.capacity?.toString() ?? "Unlimited"}
                    />
                </div>

                {closed && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        This event is {event.statusLabel.toLowerCase()}, so
                        attendees can no longer be added.
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or organization"
                        className="max-w-sm"
                    />
                    <Button
                        onClick={() => setShowForm((open) => !open)}
                        disabled={closed}
                    >
                        {showForm ? "Cancel" : "Add walk-in"}
                    </Button>
                </div>

                {showForm && !closed && (
                    <form
                        onSubmit={submit}
                        className={`${panelClass} space-y-4 p-5`}
                    >
                        <h2 className="text-sm font-semibold">
                            Add walk-in attendee
                        </h2>

                        {actionError && (
                            <p className="text-sm text-red-600">
                                {actionError}
                            </p>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData("name", e.target.value)
                                    }
                                    autoFocus
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email (optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData("email", e.target.value)
                                    }
                                />
                                {form.errors.email && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (optional)</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(e) =>
                                        form.setData("phone", e.target.value)
                                    }
                                />
                                {form.errors.phone && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="organization">
                                    Organization (optional)
                                </Label>
                                <Input
                                    id="organization"
                                    value={form.data.organization}
                                    onChange={(e) =>
                                        form.setData(
                                            "organization",
                                            e.target.value,
                                        )
                                    }
                                />
                                {form.errors.organization && (
                                    <p className="text-sm text-red-600">
                                        {form.errors.organization}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" disabled={form.processing}>
                            Add attendee
                        </Button>
                    </form>
                )}

                <div className={`${panelClass} overflow-hidden`}>
                    {visible.length === 0 ? (
                        <p className="p-6 text-sm text-muted-foreground">
                            {attendees.length === 0
                                ? "No attendees yet. Approve registrations or add a walk-in."
                                : "No attendees match your search."}
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
                                        Source
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Check-in
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        QR code
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((attendee) => (
                                    <tr
                                        key={attendee.id}
                                        className="border-b border-sidebar-border/70 last:border-0 dark:border-sidebar-border"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium">
                                                {attendee.name}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {attendee.email ?? "No email"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {attendee.organization ?? "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {attendee.source === "walk-in"
                                                ? "Walk-in"
                                                : "Registered"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {attendee.checkedIn ? (
                                                <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                                                    Checked in
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Not yet
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setQrFor(attendee)
                                                }
                                            >
                                                Show QR
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {qrFor && (
                    <QrDialog attendee={qrFor} onClose={() => setQrFor(null)} />
                )}
            </EventWorkspaceShell>
        </>
    );
}

Attendees.layout = {
    breadcrumbs: [
        {
            title: "Event Workspace",
            href: "#",
        },
        {
            title: "Attendees",
            href: "#",
        },
    ],
};
