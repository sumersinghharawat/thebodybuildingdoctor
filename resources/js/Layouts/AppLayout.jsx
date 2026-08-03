import ThemeToggle from '@/Components/ThemeToggle';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const isAdmin = user?.roles?.some((r) => ['administrator', 'admin', 'lms_manager'].includes(r));

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start overflow-hidden border-r border-edge bg-background/80 md:flex">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-edge px-6 py-6">
                    <Link href="/" className="font-semibold text-foreground">
                        {import.meta.env.VITE_APP_NAME || 'TBBD'}
                    </Link>
                    <ThemeToggle />
                </div>
                {user && (
                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 text-sm">
                        <NavItem href="/dashboard" label="Mentorship" />
                        <NavItem href="/learn" label="Courses" />
                        <NavItem href="/books" label="Books" />
                        <NavItem href="/calculator" label="Calculator" />
                        {isAdmin && (
                            <>
                                <p className="px-3 pb-2 pt-4 text-xs uppercase text-faint">Admin</p>
                                <NavItem href="/dashboard/courses" label="Manage courses" />
                                <NavItem href="/dashboard/books" label="Manage books" />
                                <NavItem href="/dashboard/book-access" label="Book access" />
                                <NavItem href="/dashboard/inquiries" label="Inquiries" />
                                <NavItem href="/dashboard/enrollments" label="Enrollments" />
                                <NavItem href="/dashboard/users" label="Users" />
                            </>
                        )}
                    </nav>
                )}
                {user && (
                    <div className="shrink-0 border-t border-edge p-4 text-sm">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                        <div className="mt-3 flex flex-col gap-2">
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
                )}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-edge px-4 py-3 md:hidden">
                    <Link href="/dashboard" className="font-semibold">
                        {import.meta.env.VITE_APP_NAME || 'TBBD'}
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
                    <nav className="space-y-1 border-b border-edge p-4 text-sm md:hidden">
                        <NavItem href="/dashboard" label="Mentorship" onNavigate={() => setMobileOpen(false)} />
                        <NavItem href="/learn" label="Courses" onNavigate={() => setMobileOpen(false)} />
                        <NavItem href="/books" label="Books" onNavigate={() => setMobileOpen(false)} />
                        <NavItem href="/calculator" label="Calculator" onNavigate={() => setMobileOpen(false)} />
                        {isAdmin && (
                            <NavItem href="/dashboard/courses" label="Admin" onNavigate={() => setMobileOpen(false)} />
                        )}
                    </nav>
                )}
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}

function NavItem({ href, label, onNavigate }) {
    const active = typeof window !== 'undefined' && window.location.pathname.startsWith(href);

    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`block rounded-lg px-3 py-2 transition ${
                active ? 'bg-surface-hover text-foreground' : 'text-muted hover:bg-surface-hover/70'
            }`}
        >
            {label}
        </Link>
    );
}
