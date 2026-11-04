import { Head, router } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { EventWorkspaceShell } from '@/components/event-workspace-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { EventDetail } from '@/types/event';

type AttendeeOption = {
    id: number;
    name: string;
    email: string | null;
    organization: string | null;
    checkedIn: boolean;
    checkedInAt: string | null;
};

type RecentCheckIn = {
    id: number;
    name: string;
    organization: string | null;
    checkedInAt: string | null;
};

type Counts = {
    total: number;
    checkedIn: number;
};

type ScanResult =
    | { kind: 'success' | 'duplicate'; name: string; at: string | null }
    | { kind: 'error'; message: string };

const READER_ID = 'qr-reader';

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

// Laravel keeps the CSRF token in the XSRF-TOKEN cookie. Inertia sends it
// automatically, but a plain fetch() has to send it itself.
function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export default function CheckIn({
    event,
    attendees,
    recent,
    counts,
}: {
    event: EventDetail;
    attendees: AttendeeOption[];
    recent: RecentCheckIn[];
    counts: Counts;
}) {
    const [scanning, setScanning] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [manualError, setManualError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [busyId, setBusyId] = useState<number | null>(null);

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const processingRef = useRef(false);
    const lastScanRef = useRef<{ token: string; at: number }>({
        token: '',
        at: 0,
    });

    const active = event.status === 'published' || event.status === 'ongoing';

    async function handleDecoded(token: string) {
        const now = Date.now();

        // Ignore frames while a scan is being processed, and the same code
        // held in front of the camera for a few seconds.
        if (processingRef.current) {
            return;
        }

        if (
            lastScanRef.current.token === token &&
            now - lastScanRef.current.at < 4000
        ) {
            return;
        }

        lastScanRef.current = { token, at: now };
        processingRef.current = true;

        try {
            const response = await fetch(
                `/events/${event.slug}/check-in/scan`,
                {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-XSRF-TOKEN': xsrfToken(),
                    },
                    body: JSON.stringify({ token }),
                },
            );

            const data = await response.json().catch(() => null);

            if (response.ok && data) {
                setResult({
                    kind:
                        data.status === 'checked_in' ? 'success' : 'duplicate',
                    name: data.attendee.name,
                    at: data.attendee.checkedInAt,
                });
                router.reload({ only: ['attendees', 'recent', 'counts'] });
            } else {
                setResult({
                    kind: 'error',
                    message:
                        data?.errors?.token?.[0] ??
                        data?.message ??
                        'Something went wrong. Please try again.',
                });
            }
        } catch {
            setResult({
                kind: 'error',
                message: 'Could not reach the server.',
            });
        } finally {
            processingRef.current = false;
        }
    }

    // The camera callback is created once, so always call the latest handler.
    const handlerRef = useRef(handleDecoded);
    handlerRef.current = handleDecoded;

    async function startCamera() {
        setCameraError(null);

        try {
            const scanner = new Html5Qrcode(READER_ID);
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (text) => {
                    void handlerRef.current(text);
                },
                () => {},
            );

            setScanning(true);
        } catch {
            scannerRef.current = null;
            setCameraError(
                'Could not start the camera. Allow camera access in your browser. The camera only works on https:// or localhost.',
            );
        }
    }

    async function stopCamera() {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        setScanning(false);

        if (scanner) {
            try {
                await scanner.stop();
                scanner.clear();
            } catch {
                // Already stopped.
            }
        }
    }

    // Turn the camera off when leaving the page.
    useEffect(() => {
        return () => {
            void stopCamera();
        };
    }, []);

    // Hide the scan result after a few seconds.
    useEffect(() => {
        if (!result) {
            return;
        }

        const timer = setTimeout(() => setResult(null), 4000);

        return () => clearTimeout(timer);
    }, [result]);

    function checkInManually(attendee: AttendeeOption) {
        router.post(
            `/events/${event.slug}/check-in/${attendee.id}`,
            {},
            {
                preserveScroll: true,
                onStart: () => {
                    setBusyId(attendee.id);
                    setManualError(null);
                },
                onError: (errors) => setManualError(errors.token ?? null),
                onFinish: () => setBusyId(null),
            },
        );
    }

    const query = search.trim().toLowerCase();
    const visible = query
        ? attendees.filter((attendee) =>
              [attendee.name, attendee.email, attendee.organization]
                  .filter(Boolean)
                  .some((value) => value!.toLowerCase().includes(query)),
          )
        : attendees;

    const resultStyles = {
        success:
            'border-green-300 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
        duplicate:
            'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
        error: 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
    };

    return (
        <>
            <Head title={`Check-in: ${event.title}`} />
            <EventWorkspaceShell event={event}>
                <div className="grid gap-4 sm:grid-cols-2">
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
                            Still to arrive
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                            {counts.total - counts.checkedIn}
                        </p>
                    </div>
                </div>

                {!active && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        Check-in is only available while the event is published
                        or ongoing. This event is{' '}
                        {event.statusLabel.toLowerCase()}.
                    </p>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panelClass} p-5 lg:col-span-2`}>
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold">
                                QR scanner
                            </h2>
                            {scanning ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => void stopCamera()}
                                >
                                    Stop camera
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    disabled={!active}
                                    onClick={() => void startCamera()}
                                >
                                    Start camera
                                </Button>
                            )}
                        </div>

                        {cameraError && (
                            <p className="mt-3 text-sm text-red-600">
                                {cameraError}
                            </p>
                        )}

                        {result && (
                            <div
                                className={`mt-3 rounded-lg border px-4 py-3 text-sm ${resultStyles[result.kind]}`}
                            >
                                {result.kind === 'success' && (
                                    <>
                                        <p className="font-semibold">
                                            Checked in
                                        </p>
                                        <p>{result.name}</p>
                                    </>
                                )}
                                {result.kind === 'duplicate' && (
                                    <>
                                        <p className="font-semibold">
                                            Already checked in
                                        </p>
                                        <p>
                                            {result.name} at{' '}
                                            {formatTime(result.at)}
                                        </p>
                                    </>
                                )}
                                {result.kind === 'error' && (
                                    <>
                                        <p className="font-semibold">
                                            Not accepted
                                        </p>
                                        <p>{result.message}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* The camera preview is drawn into this element. */}
                        <div
                            id={READER_ID}
                            className={
                                scanning
                                    ? 'mt-4 w-full max-w-md overflow-hidden rounded-lg'
                                    : 'hidden'
                            }
                        />

                        {!scanning && (
                            <p className="mt-3 text-sm text-muted-foreground">
                                Press Start camera, then hold an attendee's QR
                                code in front of it. Use the search below for
                                anyone who cannot show a code.
                            </p>
                        )}
                    </section>

                    <section className={panelClass}>
                        <h2 className="border-b border-sidebar-border/70 px-5 py-3 text-sm font-semibold dark:border-sidebar-border">
                            Recent check-ins
                        </h2>
                        {recent.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                Nobody has checked in yet.
                            </p>
                        ) : (
                            <ul>
                                {recent.map((item) => (
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
                </div>

                <section className={panelClass}>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sidebar-border/70 px-5 py-3 dark:border-sidebar-border">
                        <h2 className="text-sm font-semibold">
                            Manual check-in
                        </h2>
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or organization"
                            className="max-w-xs"
                        />
                    </div>

                    {manualError && (
                        <p className="px-5 pt-3 text-sm text-red-600">
                            {manualError}
                        </p>
                    )}

                    {visible.length === 0 ? (
                        <p className="p-5 text-sm text-muted-foreground">
                            {attendees.length === 0
                                ? 'No attendees yet.'
                                : 'No attendees match your search.'}
                        </p>
                    ) : (
                        <ul className="max-h-96 overflow-y-auto">
                            {visible.map((attendee) => (
                                <li
                                    key={attendee.id}
                                    className="flex items-center justify-between gap-4 border-b border-sidebar-border/70 px-5 py-3 last:border-0 dark:border-sidebar-border"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {attendee.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {attendee.organization ??
                                                attendee.email ??
                                                '-'}
                                        </p>
                                    </div>

                                    {attendee.checkedIn ? (
                                        <span className="text-sm text-green-600">
                                            Checked in{' '}
                                            {formatTime(attendee.checkedInAt)}
                                        </span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                !active ||
                                                busyId === attendee.id
                                            }
                                            onClick={() =>
                                                checkInManually(attendee)
                                            }
                                        >
                                            Check in
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </EventWorkspaceShell>
        </>
    );
}

CheckIn.layout = {
    breadcrumbs: [
        {
            title: 'Event Workspace',
            href: '#',
        },
        {
            title: 'Check-in',
            href: '#',
        },
    ],
};
