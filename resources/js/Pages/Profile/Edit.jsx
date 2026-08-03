import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import ManagePasskeysForm from './Partials/ManagePasskeysForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function initials(name = '') {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '?';
}

function hasAppAccess(roles = []) {
    return roles.some((r) =>
        ['administrator', 'admin', 'lms_manager', 'media_channel'].includes(r),
    );
}

function roleLabel(roles = []) {
    if (roles.some((r) => ['administrator', 'admin', 'lms_manager'].includes(r))) {
        return 'Administrator';
    }
    if (roles.includes('media_channel')) {
        return 'Member';
    }
    return roles[0] || 'Member';
}

export default function Edit({ mustVerifyEmail, status, passkeys }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const name = user?.name || 'Member';
    const canOpenApp = hasAppAccess(user?.roles);

    return (
        <AppLayout>
            <Head title="Profile" />

            <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
                <header className="space-y-2">
                    <div className="pill w-fit">Account</div>
                    <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Profile</h1>
                    <p className="max-w-2xl text-sm text-muted">
                        Manage your account details, password, and face lock sign-in.
                    </p>
                </header>

                <section className="card-surface overflow-hidden">
                    <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold text-white shadow-soft-glow">
                                {initials(name)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="truncate text-xl font-semibold text-foreground">{name}</h2>
                                <p className="mt-0.5 truncate text-sm text-muted">{user?.email}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="pill">{roleLabel(user?.roles)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {canOpenApp && (
                                <>
                                    <Link href={route('learn.index')} className="btn-secondary">
                                        My courses
                                    </Link>
                                    <Link href={route('books.index')} className="btn-secondary">
                                        Books
                                    </Link>
                                </>
                            )}
                            <Link href={route('calculator')} className="btn-primary">
                                Calculator
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <nav className="card-surface h-fit space-y-1 p-3 lg:sticky lg:top-6">
                        <ProfileNavLink href="#profile-info" label="Profile information" />
                        <ProfileNavLink href="#password" label="Password" />
                        <ProfileNavLink href="#face-lock" label="Face lock login" />
                        <ProfileNavLink href="#danger" label="Delete account" tone="danger" />
                    </nav>

                    <div className="space-y-6">
                        <section id="profile-info" className="card-surface scroll-mt-6 p-6 md:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </section>

                        <section id="password" className="card-surface scroll-mt-6 p-6 md:p-8">
                            <UpdatePasswordForm />
                        </section>

                        <section id="face-lock" className="card-surface scroll-mt-6 p-6 md:p-8">
                            <ManagePasskeysForm passkeys={passkeys} />
                        </section>

                        <section
                            id="danger"
                            className="scroll-mt-6 rounded-xl border border-red-300/70 bg-red-50/80 p-6 md:p-8 dark:border-red-900/50 dark:bg-red-950/20"
                        >
                            <DeleteUserForm />
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ProfileNavLink({ href, label, tone = 'default' }) {
    const base =
        'block rounded-lg px-3 py-2 text-sm transition hover:bg-surface-hover';
    const color =
        tone === 'danger'
            ? 'text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200'
            : 'text-muted hover:text-foreground';

    return (
        <a href={href} className={`${base} ${color}`}>
            {label}
        </a>
    );
}
