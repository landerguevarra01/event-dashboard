import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { EventStatusBadge } from '@/components/event-status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EventStatus } from '@/types/event';

type EventSummary = {
    id: number;
    title: string;
    slug: string;
    status: EventStatus;
    statusLabel: string;
};

type Settings = {
    registration_enabled: boolean;
    registration_opens_at: string | null;
    registration_closes_at: string | null;
    capacity: number | null;
};

export default function RegistrationSettings({
    event,
    settings,
}: {
    event: EventSummary;
    settings: Settings;
}) {
    const form = useForm({
        registration_enabled: settings.registration_enabled,
        registration_opens_at: settings.registration_opens_at ?? '',
        registration_closes_at: settings.registration_closes_at ?? '',
        capacity: settings.capacity?.toString() ?? '',
    });

    const [publishing, setPublishing] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/super-admin/events/${event.slug}/registration`, {
            preserveScroll: true,
        });
    }

    function publish() {
        router.post(
            `/super-admin/events/${event.slug}/publish`,
            {},
            {
                preserveScroll: true,
                onStart: () => {
                    setPublishing(true);
                    setPublishError(null);
                },
                onError: (errors) => setPublishError(errors.publish ?? null),
                onFinish: () => setPublishing(false),
            },
        );
    }

    return (
        <>
            <Head title={`Registration: ${event.title}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold">
                            Configure Registration & Settings
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

                <form
                    onSubmit={submit}
                    className="max-w-2xl space-y-5 rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border"
                >
                    <label className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            checked={form.data.registration_enabled}
                            onChange={(e) =>
                                form.setData(
                                    'registration_enabled',
                                    e.target.checked,
                                )
                            }
                            className="mt-1 size-4 rounded border-input"
                        />
                        <span>
                            <span className="block text-sm font-medium">
                                Registration is open
                            </span>
                            <span className="block text-sm text-muted-foreground">
                                Turn this off to stop accepting new
                                registrations.
                            </span>
                        </span>
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="registration_opens_at">
                                Registration opens
                            </Label>
                            <Input
                                id="registration_opens_at"
                                type="datetime-local"
                                value={form.data.registration_opens_at}
                                onChange={(e) =>
                                    form.setData(
                                        'registration_opens_at',
                                        e.target.value,
                                    )
                                }
                            />
                            {form.errors.registration_opens_at && (
                                <p className="text-sm text-red-600">
                                    {form.errors.registration_opens_at}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="registration_closes_at">
                                Registration closes
                            </Label>
                            <Input
                                id="registration_closes_at"
                                type="datetime-local"
                                value={form.data.registration_closes_at}
                                onChange={(e) =>
                                    form.setData(
                                        'registration_closes_at',
                                        e.target.value,
                                    )
                                }
                            />
                            {form.errors.registration_closes_at && (
                                <p className="text-sm text-red-600">
                                    {form.errors.registration_closes_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            min={1}
                            value={form.data.capacity}
                            onChange={(e) =>
                                form.setData('capacity', e.target.value)
                            }
                            placeholder="Leave empty for unlimited"
                        />
                        {form.errors.capacity && (
                            <p className="text-sm text-red-600">
                                {form.errors.capacity}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            Save settings
                        </Button>
                        <Button variant="outline" asChild>
                            <Link
                                href={`/super-admin/events/${event.slug}/organizers`}
                            >
                                Back to organizers
                            </Link>
                        </Button>
                        {form.recentlySuccessful && (
                            <span className="text-sm text-green-600">
                                Saved.
                            </span>
                        )}
                    </div>
                </form>

                {event.status === 'draft' && (
                    <div className="max-w-2xl space-y-3 rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border">
                        <div>
                            <h2 className="font-semibold">Publish event</h2>
                            <p className="text-sm text-muted-foreground">
                                Publishing makes the event live. Save your
                                settings first. An event needs start and end
                                dates and at least one Event Admin.
                            </p>
                        </div>

                        {publishError && (
                            <p className="text-sm text-red-600">
                                {publishError}
                            </p>
                        )}

                        <Button onClick={publish} disabled={publishing}>
                            Publish event
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

RegistrationSettings.layout = {
    breadcrumbs: [
        {
            title: 'All Events',
            href: '/super-admin/events',
        },
        {
            title: 'Registration',
            href: '#',
        },
    ],
};
