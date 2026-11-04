import { Head } from '@inertiajs/react';

type Stats = {
    totalUsers: number;
    superAdmins: number;
    eventAdmins: number;
    staff: number;
};

const cardClass =
    'rounded-xl border border-sidebar-border/70 p-6 dark:border-sidebar-border';

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className={cardClass}>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
        </div>
    );
}

export default function SuperAdminDashboard({ stats }: { stats: Stats }) {
    return (
        <>
            <Head title="Global Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div>
                    <h1 className="text-xl font-semibold">Global Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Overview of all users and events across the system.
                    </p>
                </div>

                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total users" value={stats.totalUsers} />
                    <StatCard label="Super admins" value={stats.superAdmins} />
                    <StatCard label="Event admins" value={stats.eventAdmins} />
                    <StatCard label="Staff" value={stats.staff} />
                </div>

                <div className={`${cardClass} flex-1`}>
                    <p className="text-sm text-muted-foreground">
                        Event analytics will appear here once events are set up.
                    </p>
                </div>
            </div>
        </>
    );
}

SuperAdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Global Dashboard',
            href: '/super-admin/dashboard',
        },
    ],
};
