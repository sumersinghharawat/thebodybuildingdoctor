import ThemeToggle from '@/Components/ThemeToggle';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const NAV_GROUPS = [
    {
        label: 'Overview',
        items: [{ href: '/dashboard/admin', label: 'Dashboard', match: 'exact' }],
    },
    {
        label: 'Inbox',
        items: [{ href: '/dashboard/inquiries', label: 'Inquiries' }],
    },
    {
        label: 'Content',
        items: [
            { href: '/dashboard/courses', label: 'Courses' },
            { href: '/dashboard/books', label: 'Books' },
            { href: '/dashboard/mentorship', label: 'Mentorship' },
        ],
    },
    {
        label: 'Access',
        items: [
            { href: '/dashboard/enrollments', label: 'Enrollments' },
            { href: '/dashboard/book-access', label: 'Book access' },
            { href: '/dashboard/mentorship-access', label: 'Mentorship access' },
        ],
    },
    {
        label: 'People',
        items: [{ href: '/dashboard/users', label: 'Users' }],
    },
    {
        label: 'Site',
        items: [
            { href: '/dashboard/landing-app', label: 'Landing app' },
            { href: '/dashboard/settings', label: 'Settings' },
        ],
    },
];

function pathOf(url) {
    return (url || '').split('?')[0];
}

function isActive(href, url, match = 'prefix') {
    const path = pathOf(url);
    if (match === 'exact') {
        return path === href;
    }
    return path === href || path.startsWith(`${href}/`);
}

export default function AdminLayout({ children }) {
    const page = usePage();
    const user = page.props.auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const currentUrl = page.url || '';

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start overflow-hidden border-r border-edge bg-surface/40 md:flex">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-edge px-5 py-5">
                    <div>
                        <Link href={route('admin.dashboard')} className="font-semibold text-foreground">
                            Admin
                        </Link>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-faint">
                            {import.meta.env.VITE_APP_NAME || 'TBBD'}
                        </p>
                    </div>
                    <ThemeToggle />
                </div>

                <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 text-sm">
                    {NAV_GROUPS.map((group) => (
                        <div key={group.label}>
                            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-faint">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map((item) => (
                                    <AdminNavLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        active={isActive(item.href, currentUrl, item.match)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="shrink-0 space-y-3 border-t border-edge p-4 text-sm">
                    <div>
                        <p className="truncate font-medium">{user?.name}</p>
                        <p className="truncate text-xs text-muted">{user?.email}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Link href={route('dashboard')} className="text-muted hover:text-foreground">
                            ← Member app
                        </Link>
                        <Link href={route('profile.edit')} className="text-muted hover:text-foreground">
                            Profile
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.post(route('logout'))}
                            className="text-left text-muted hover:text-foreground"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-edge px-4 py-3 md:hidden">
                    <Link href={route('admin.dashboard')} className="font-semibold">
                        Admin
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            type="button"
                            className="rounded-lg border border-edge px-3 py-1.5 text-sm"
                            onClick={() => setMobileOpen((v) => !v)}
                        >
                            Menu
                        </button>
                    </div>
                </header>

                {mobileOpen && (
                    <nav className="space-y-4 border-b border-edge p-4 text-sm md:hidden">
                        {NAV_GROUPS.map((group) => (
                            <div key={group.label} className="space-y-1">
                                <p className="px-3 text-[11px] font-medium uppercase tracking-wide text-faint">
                                    {group.label}
                                </p>
                                {group.items.map((item) => (
                                    <AdminNavLink
                                        key={item.href}
                                        href={item.href}
                                        label={item.label}
                                        active={isActive(item.href, currentUrl, item.match)}
                                        onNavigate={() => setMobileOpen(false)}
                                    />
                                ))}
                            </div>
                        ))}
                        <Link
                            href={route('dashboard')}
                            className="block rounded-lg px-3 py-2 text-muted"
                            onClick={() => setMobileOpen(false)}
                        >
                            ← Member app
                        </Link>
                    </nav>
                )}

                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}

function AdminNavLink({ href, label, active, onNavigate }) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2 transition ${
                active
                    ? 'bg-accent text-white'
                    : 'text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
        >
            {label}
        </Link>
    );
}
