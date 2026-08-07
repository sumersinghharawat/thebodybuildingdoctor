import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteMentorshipAccess, fetchMentorshipAccessList } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function MentorshipAccessIndex() {
    const [grants, setGrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMentorshipAccessList()
            .then((data) => setGrants(data.mentorshipAccess || []))
            .finally(() => setLoading(false));
    }, []);

    async function revoke(uid, name) {
        if (!confirm(`Revoke mentorship access for ${name || 'this member'}?`)) return;
        await deleteMentorshipAccess(uid);
        setGrants((prev) => prev.filter((g) => g.uid !== uid));
    }

    const counts = useMemo(() => ({
        all: grants.length,
        active: grants.filter((item) => item.status === 'active').length,
        revoked: grants.filter((item) => item.status === 'revoked').length,
    }), [grants]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return grants
            .filter((grant) => {
                if (statusFilter === 'active' && grant.status !== 'active') return false;
                if (statusFilter === 'revoked' && grant.status !== 'revoked') return false;
                if (!q) return true;
                return [grant.userName, grant.userEmail, grant.status, grant.note, grant.uid, grant.source]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.userName || a.uid).localeCompare(String(b.userName || b.uid)));
    }, [grants, query, statusFilter]);

    return (
        <AdminShell
            title="Mentorship access"
            description="Members with the media_channel role (or an explicit grant) can open mentorship content."
            actions={
                <Link href={route('admin.mentorship-access.create')} className="btn-primary">
                    Grant access
                </Link>
            }
        >
            <Head title="Mentorship access" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by name, email, or note…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'active', label: 'Active', count: counts.active },
                            ...(counts.revoked > 0
                                ? [{ value: 'revoked', label: 'Revoked', count: counts.revoked }]
                                : []),
                        ]}
                        resultLabel={`${filtered.length} member${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No members match' : 'No mentorship members yet'}
                            description="Grant access to give a user the media_channel role so they can open mentorship."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((grant) => (
                                <article
                                    key={grant.uid}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{grant.userName || grant.uid}</p>
                                            <StatusBadge status={grant.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-muted">{grant.userEmail}</p>
                                        <p className="mt-1 text-xs text-faint">
                                            via {grant.source === 'role' ? 'member role' : grant.source}
                                            {grant.note ? ` · ${grant.note}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href={route('admin.users.edit', grant.uid)}
                                            className="btn-secondary"
                                        >
                                            Edit user
                                        </Link>
                                        <Link
                                            href={route('admin.mentorship-access.edit', grant.uid)}
                                            className="btn-secondary"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-600 dark:text-red-300"
                                            onClick={() => revoke(grant.uid, grant.userName)}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
