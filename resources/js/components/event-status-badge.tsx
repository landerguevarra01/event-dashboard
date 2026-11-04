import type { EventStatus } from '@/types/event';

const statusStyles: Record<EventStatus, string> = {
    draft: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    published: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    ongoing:
        'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    completed:
        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    archived:
        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
};

export function EventStatusBadge({
    status,
    label,
}: {
    status: EventStatus;
    label: string;
}) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
        >
            {label}
        </span>
    );
}
