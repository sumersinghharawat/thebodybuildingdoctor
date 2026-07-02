import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);
    const isAdmin = user?.roles?.some((r) => ['administrator', 'admin', 'lms_manager'].includes(r));

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950/80 md:flex">
                <div className="border-b border-slate-800 px-6 py-6">
                    <Link href="/" className="font-semibold text-slate-100">
                        {import.meta.env.VITE_APP_NAME || 'TBBD'}
                    </Link>
                </div>
                {user && (
                    <nav className="flex-1 space-y-1 px-4 py-4 text-sm">
                        <NavItem href="/dashboard" label="News & Articles" />
                        <NavItem href="/learn" label="Courses" />
                        {isAdmin && (
                            <>
                                <p className="px-3 pb-2 pt-4 text-xs uppercase text-slate-500">Admin</p>
                                <NavItem href="/dashboard/courses" label="Manage courses" />
                                <NavItem href="/dashboard/inquiries" label="Inquiries" />
                                <NavItem href="/dashboard/enrollments" label="Enrollments" />
                                <NavItem href="/dashboard/users" label="Users" />
                            </>
                        )}
                    </nav>
                )}
                {user && (
                    <div className="border-t border-slate-800 p-4 text-sm">
                        <p className="truncate font-medium">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                        <div className="mt-3 flex flex-col gap-2">
                            <Link href={route('profile.edit')} className="text-slate-300 hover:text-white">
                                Profile
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.post(route('logout'))}
                                className="text-left text-slate-400 hover:text-white"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                )}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3 md:hidden">
                    <Link href="/dashboard" className="font-semibold">
                        {import.meta.env.VITE_APP_NAME || 'TBBD'}
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm"
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        Menu
                    </button>
                </header>
                {mobileOpen && (
                    <nav className="space-y-1 border-b border-slate-800 p-4 text-sm md:hidden">
                        <NavItem href="/dashboard" label="News & Articles" onNavigate={() => setMobileOpen(false)} />
                        <NavItem href="/learn" label="Courses" onNavigate={() => setMobileOpen(false)} />
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
                active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70'
            }`}
        >
            {label}
        </Link>
    );
}
