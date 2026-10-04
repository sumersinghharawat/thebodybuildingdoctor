import AdminShell from '@/Components/Admin/AdminShell';
import { fetchAdminStats } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recentInquiries, setRecentInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminStats()
            .then((data) => {
                setStats(data.stats);
                setRecentInquiries(data.recentInquiries || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminShell
            title="Dashboard"
            description="Overview of content, access, and inquiries across the platform."
            actions={
                <Link href={route('admin.inquiries.index')} className="btn-primary">
                    Open inquiries
                </Link>
            }
        >
            <Head title="Admin dashboard" />

            {loading && <p className="text-sm text-muted">Loading stats…</p>}
            {error && (
                <p className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                </p>
            )}

            {!loading && !error && stats && (
                <div className="space-y-8">
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard
                            label="New inquiries"
                            value={stats.inquiriesNew}
                            hint={`${stats.inquiries} total`}
                            href={route('admin.inquiries.index')}
                            accent
                        />
                        <StatCard
                            label="Open support tickets"
                            value={stats.supportTicketsOpen}
                            hint={`${stats.supportTickets || 0} total`}
                            href={route('admin.support.index')}
                        />
                        <StatCard
                            label="Pending book access"
                            value={stats.bookPurchasesPending}
                            hint={`${stats.bookPurchasesActive} active`}
                            href={route('admin.book-access.index')}
                        />
                        <StatCard
                            label="Active enrollments"
                            value={stats.enrollmentsActive}
                            hint={`${stats.enrollments} total`}
                            href={route('admin.enrollments.index')}
                        />
                        <StatCard
                            label="Users"
                            value={stats.users}
                            hint="Members & admins"
                            href={route('admin.users.index')}
                        />
                    </section>

                    <section className="grid gap-4 lg:grid-cols-3">
                        <ContentCard
                            title="Courses"
                            href={route('admin.courses.index')}
                            createHref={route('admin.courses.create')}
                            total={stats.courses}
                            rows={[
                                ['Published', stats.coursesPublished],
                                ['Draft', stats.coursesDraft],
                                ['Lessons', stats.lessons],
                            ]}
                        />
                        <ContentCard
                            title="Books"
                            href={route('admin.books.index')}
                            createHref={route('admin.books.create')}
                            total={stats.books}
                            rows={[
                                ['Published', stats.booksPublished],
                                ['Draft', stats.booksDraft],
                                ['Purchases', stats.bookPurchases],
                            ]}
                        />
                        <ContentCard
                            title="Mentorship"
                            href={route('admin.mentorship.index')}
                            createHref={route('admin.mentorship.create')}
                            total={stats.mentorship}
                            rows={[
                                ['Published', stats.mentorshipPublished],
                                ['Draft', stats.mentorshipDraft],
                                ['Access grants', stats.mentorshipAccessActive],
                            ]}
                        />
                    </section>

                    <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                        <div className="card-surface p-5 md:p-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold">Recent inquiries</h2>
                                    <p className="text-sm text-muted">Newest access requests from the landing page.</p>
                                </div>
                                <Link href={route('admin.inquiries.index')} className="btn-secondary">
                                    View all
                                </Link>
                            </div>

                            {recentInquiries.length === 0 ? (
                                <p className="text-sm text-muted">No inquiries yet.</p>
                            ) : (
                                <ul className="divide-y divide-edge">
                                    {recentInquiries.map((inquiry) => (
                                        <li
                                            key={inquiry.id}
                                            className="flex flex-wrap items-start justify-between gap-3 py-3"
                                        >
                                            <div className="min-w-0">
                                                <p className="font-medium text-foreground">{inquiry.name}</p>
                                                <p className="truncate text-sm text-muted">{inquiry.email}</p>
                                                <p className="mt-1 text-xs text-faint">
                                                    {inquiry.type}
                                                    {inquiry.courseTitle ? ` · ${inquiry.courseTitle}` : ''}
                                                    {inquiry.createdAt ? ` · ${formatDate(inquiry.createdAt)}` : ''}
                                                </p>
                                            </div>
                                            <StatusPill status={inquiry.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="card-surface space-y-4 p-5 md:p-6">
                            <div>
                                <h2 className="text-lg font-semibold">Inquiry status</h2>
                                <p className="text-sm text-muted">Pipeline across all requests.</p>
                            </div>
                            <div className="space-y-3">
                                <MeterRow label="New" value={stats.inquiriesNew} total={stats.inquiries} />
                                <MeterRow label="Contacted" value={stats.inquiriesContacted} total={stats.inquiries} />
                                <MeterRow label="Closed" value={stats.inquiriesClosed} total={stats.inquiries} />
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link href={route('admin.enrollments.create')} className="btn-secondary text-center">
                                    Grant enrollment
                                </Link>
                                <Link href={route('admin.book-access.create')} className="btn-secondary text-center">
                                    Grant book access
                                </Link>
                                <Link href={route('admin.users.create')} className="btn-secondary text-center">
                                    New user
                                </Link>
                                <Link href={route('admin.settings.edit')} className="btn-secondary text-center">
                                    Settings
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </AdminShell>
    );
}

function StatCard({ label, value, hint, href, accent = false }) {
    return (
        <Link
            href={href}
            className={`card-surface block p-5 transition hover:border-faint ${
                accent ? 'border-accent/40 bg-accent/5' : ''
            }`}
        >
            <p className="text-xs font-medium uppercase tracking-wide text-faint">{label}</p>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="mt-1 text-sm text-muted">{hint}</p>
        </Link>
    );
}

function ContentCard({ title, href, createHref, total, rows }) {
    return (
        <div className="card-surface flex h-full flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted">{total} total</p>
                </div>
                <Link href={createHref} className="btn-secondary">
                    New
                </Link>
            </div>
            <dl className="space-y-2 text-sm">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                        <dt className="text-muted">{label}</dt>
                        <dd className="font-medium tabular-nums text-foreground">{value}</dd>
                    </div>
                ))}
            </dl>
            <Link href={href} className="mt-5 text-sm font-medium text-accentSoft hover:text-accent">
                Manage {title.toLowerCase()} →
            </Link>
        </div>
    );
}

function MeterRow({ label, value, total }) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted">{label}</span>
                <span className="tabular-nums text-foreground">
                    {value}
                    <span className="text-faint"> · {pct}%</span>
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    const styles = {
        new: 'border-amber-300/70 bg-amber-50 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200',
        contacted:
            'border-sky-300/70 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200',
        closed:
            'border-edge bg-surface text-muted',
    };

    return (
        <span className={`pill shrink-0 ${styles[status] || styles.closed}`}>{status}</span>
    );
}
