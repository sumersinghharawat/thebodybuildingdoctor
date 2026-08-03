import { Link, usePage } from '@inertiajs/react';

const links = [
    { href: '/dashboard/courses', label: 'Courses' },
    { href: '/dashboard/books', label: 'Books' },
    { href: '/dashboard/book-access', label: 'Book access' },
    { href: '/dashboard/inquiries', label: 'Inquiries' },
    { href: '/dashboard/enrollments', label: 'Enrollments' },
    { href: '/dashboard/mentorship', label: 'Mentorship' },
    { href: '/dashboard/mentorship-access', label: 'Mentorship access' },
    { href: '/dashboard/landing-app', label: 'Landing app' },
    { href: '/dashboard/settings', label: 'Settings' },
    { href: '/dashboard/users', label: 'Users' },
];

export default function AdminNav() {
    const { url } = usePage();

    return (
        <div className="mb-8 space-y-4">
            <div>
                <div className="pill mb-2 w-fit">Course Admin</div>
                <h1 className="text-2xl font-semibold text-foreground">Manage courses & access</h1>
                <p className="mt-1 text-sm text-muted">
                    Manage users, courses, lessons, enrollments, and mentorship.
                </p>
            </div>
            <nav className="flex flex-wrap gap-2">
                {links.map(({ href, label }) => {
                    const active = url === href || url.startsWith(`${href}/`);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition ${
                                active
                                    ? 'bg-accent text-white'
                                    : 'border border-edge bg-surface/80 text-muted hover:bg-surface-hover'
                            }`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
