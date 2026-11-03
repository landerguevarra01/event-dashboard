export type UserRole = 'super_admin' | 'event_admin' | 'staff';

export type User = {
    id: number;
    name: string;
    email: string;
    role: UserRole
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};
