import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { EventDetail } from '@/types/event';

type InformationForm = {
    title: string;
    venue: string | null;
    description: string | null;
    starts_at: string | null;
    ends_at: string | null;
};

export default function EventInformation({
    event,
    form: initial,
}: {
    event: EventDetail;
    form: InformationForm;
}) {
    const form = useForm({
        title: initial.title,
        venue: initial.venue ?? '',
        description: initial.description ?? '',
        starts_at: initial.starts_at ?? '',
        ends_at: initial.ends_at ?? '',
    });

    const locked = event.status === 'archived';

    function submit(e: FormEvent) {
        e.preventDefault();
        form.put(`/events/${event.slug}/information`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Information: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                {locked && (
                    <p className="max-w-2xl rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        This event is archived, so its details can no longer be
                        edited.
                    </p>
                )}

                <form
                    onSubmit={submit}
                    className="max-w-2xl space-y-5 rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border"
                >
                    <div className="space-y-2">
                        <Label htmlFor="title">Event title</Label>
                        <Input
                            id="title"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            disabled={locked}
                        />
                        {form.errors.title && (
                            <p className="text-sm text-red-600">
                                {form.errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="venue">Venue</Label>
                        <Input
                            id="venue"
                            value={form.data.venue}
                            onChange={(e) =>
                                form.setData('venue', e.target.value)
                            }
                            disabled={locked}
                        />
                        {form.errors.venue && (
                            <p className="text-sm text-red-600">
                                {form.errors.venue}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            rows={5}
                            disabled={locked}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
                        />
                        {form.errors.description && (
                            <p className="text-sm text-red-600">
                                {form.errors.description}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="starts_at">Starts</Label>
                            <Input
                                id="starts_at"
                                type="datetime-local"
                                value={form.data.starts_at}
                                onChange={(e) =>
                                    form.setData('starts_at', e.target.value)
                                }
                                disabled={locked}
                            />
                            {form.errors.starts_at && (
                                <p className="text-sm text-red-600">
                                    {form.errors.starts_at}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ends_at">Ends</Label>
                            <Input
                                id="ends_at"
                                type="datetime-local"
                                value={form.data.ends_at}
                                onChange={(e) =>
                                    form.setData('ends_at', e.target.value)
                                }
                                disabled={locked}
                            />
                            {form.errors.ends_at && (
                                <p className="text-sm text-red-600">
                                    {form.errors.ends_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing || locked}
                        >
                            Save changes
                        </Button>
                        {form.recentlySuccessful && (
                            <span className="text-sm text-green-600">
                                Saved.
                            </span>
                        )}
                    </div>
                </form>
            </EventWorkspaceShell>
        </>
    );
}

EventInformation.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
        {
            title: 'Information',
            href: '#',
        },
    ],
};
