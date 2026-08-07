import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteEnrollment, fetchEnrollments } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function groupByUser(enrollments) {
    const groups = new Map();

    for (const enrollment of enrollments) {
        const key = enrollment.uid;
        if (!groups.has(key)) {
            groups.set(key, {
                uid: enrollment.uid,
                name: enrollment.userName || enrollment.uid,
                email: enrollment.userEmail || '',
                enrollments: [],
            });
        }
        groups.get(key).enrollments.push(enrollment);
    }

    return [...groups.values()]
        .map((group) => ({
            ...group,
            activeCount: group.enrollments.filter((item) => item.status === 'active').length,
            enrollments: [...group.enrollments].sort((a, b) =>
                String(a.courseTitle || a.courseId).localeCompare(String(b.courseTitle || b.courseId)),
            ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export default function EnrollmentsIndex() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(() => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get('q') || '';
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchEnrollments()
            .then((data) => setEnrollments(data.enrollments))
            .finally(() => setLoading(false));
    }, []);

    async function revoke(enrollment) {
        if (!confirm(`Revoke enrollment for "${enrollment.courseTitle || enrollment.courseId}"?`)) return;
        await deleteEnrollment(enrollment.uid, enrollment.courseId);
        setEnrollments((prev) =>
            prev.filter((item) => !(item.uid === enrollment.uid && item.courseId === enrollment.courseId)),
        );
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return enrollments.filter((enrollment) => {
            if (statusFilter !== 'all' && enrollment.status !== statusFilter) {
                return false;
            }
            if (!q) return true;
            return [enrollment.userName, enrollment.userEmail, enrollment.courseTitle, enrollment.status, enrollment.source, enrollment.uid]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [enrollments, query, statusFilter]);

    const groups = useMemo(() => groupByUser(filtered), [filtered]);

    useEffect(() => {
        if (!query.trim()) return;
        const next = {};
        for (const group of groups) {
            next[group.uid] = true;
        }
        setExpanded(next);
    }, [query, groups]);

    const counts = useMemo(() => {
        const all = enrollments.length;
        const active = enrollments.filter((item) => item.status === 'active').length;
        const expired = enrollments.filter((item) => item.status === 'expired').length;
        const revoked = enrollments.filter((item) => item.status === 'revoked').length;
        return { all, active, expired, revoked };
    }, [enrollments]);

    function toggle(uid) {
        setExpanded((prev) => ({ ...prev, [uid]: !prev[uid] }));
    }

    function grantMore(uid) {
        const params = new URLSearchParams({ uid, returnTo: route('admin.enrollments.index') });
        router.visit(`${route('admin.enrollments.create')}?${params}`);
    }

    return (
        <AdminShell
            title="Enrollments"
            description="Find a member, then see every course they are enrolled in."
            actions={
                <Link href={route('admin.enrollments.create')} className="btn-primary">
                    Grant enrollment
                </Link>
            }
        >
            <Head title="Enrollments" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search member name, email, or course…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'active', label: 'Active', count: counts.active },
                            { value: 'expired', label: 'Expired', count: counts.expired },
                            { value: 'revoked', label: 'Revoked', count: counts.revoked },
                        ]}
                        resultLabel={`${groups.length} member${groups.length === 1 ? '' : 's'} · ${filtered.length} enrollment${filtered.length === 1 ? '' : 's'}`}
                    />

                    {groups.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No enrollments match' : 'No enrollments yet'}
                            description="Grant a course enrollment to a member to see them listed here by user."
                        />
                    ) : (
                        <div className="space-y-3">
                            {groups.map((group) => {
                                const open = Boolean(expanded[group.uid]);
                                return (
                                    <section key={group.uid} className="card-surface overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => toggle(group.uid)}
                                            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-surface-hover/50"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold text-foreground">{group.name}</p>
                                                    <span className="pill">
                                                        {group.enrollments.length} course
                                                        {group.enrollments.length === 1 ? '' : 's'}
                                                    </span>
                                                    {group.activeCount > 0 && (
                                                        <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                                            {group.activeCount} active
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 truncate text-sm text-muted">{group.email}</p>
                                            </div>
                                            <span className="shrink-0 text-sm text-faint">{open ? 'Hide' : 'Show'}</span>
                                        </button>

                                        {open && (
                                            <div className="border-t border-edge">
                                                <div className="flex flex-wrap gap-2 px-4 py-3">
                                                    <button
                                                        type="button"
                                                        className="btn-primary"
                                                        onClick={() => grantMore(group.uid)}
                                                    >
                                                        Add course
                                                    </button>
                                                    <Link
                                                        href={route('admin.users.edit', group.uid)}
                                                        className="btn-secondary"
                                                    >
                                                        Edit user
                                                    </Link>
                                                </div>
                                                <ul className="divide-y divide-edge border-t border-edge">
                                                    {group.enrollments.map((enrollment) => (
                                                        <li
                                                            key={`${enrollment.uid}_${enrollment.courseId}`}
                                                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-foreground">
                                                                    {enrollment.courseTitle || enrollment.courseId}
                                                                </p>
                                                                <p className="mt-1 text-xs text-faint">
                                                                    {enrollment.source}
                                                                    {enrollment.expiresAt
                                                                        ? ` · expires ${new Date(enrollment.expiresAt).toLocaleDateString()}`
                                                                        : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <StatusBadge status={enrollment.status} />
                                                                <Link
                                                                    href={route('admin.enrollments.edit', [
                                                                        enrollment.uid,
                                                                        enrollment.courseId,
                                                                    ])}
                                                                    className="btn-secondary"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="btn-secondary text-red-600 dark:text-red-300"
                                                                    onClick={() => revoke(enrollment)}
                                                                >
                                                                    Revoke
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
