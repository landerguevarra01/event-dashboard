import { Head, Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateEvent() {
    const form = useForm({
        title: "",
        venue: "",
        description: "",
        starts_at: "",
        ends_at: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post("/super-admin/events");
    }

    return (
        <>
            <Head title="Create Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-xl font-semibold">Create New Event</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter the basic details. The event is saved as a draft,
                        and you can publish it once everything is set up.
                    </p>
                </div>

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
                                form.setData("title", e.target.value)
                            }
                            placeholder="e.g. Annual Company Summit"
                            autoFocus
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
                                form.setData("venue", e.target.value)
                            }
                            placeholder="Optional"
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
                                form.setData("description", e.target.value)
                            }
                            rows={4}
                            placeholder="Optional"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                                    form.setData("starts_at", e.target.value)
                                }
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
                                    form.setData("ends_at", e.target.value)
                                }
                            />
                            {form.errors.ends_at && (
                                <p className="text-sm text-red-600">
                                    {form.errors.ends_at}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            Save as draft
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/super-admin/events">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

CreateEvent.layout = {
    breadcrumbs: [
        {
            title: "All Events",
            href: "/super-admin/events",
        },
        {
            title: "Create Event",
            href: "/super-admin/events/create",
        },
    ],
};
