import AdminShell from '@/Components/Admin/AdminShell';
import { deleteMentorshipAccess, fetchMentorshipAccessList, fetchUsers } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MentorshipAccessIndex() {
    const [grants, setGrants] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        Promise.all([fetchMentorshipAccessList(), fetchUsers()])
            .then(([grantData, userData]) => {
                setGrants(grantData.mentorshipAccess || []);
                setUsers(Object.fromEntries(userData.users.map((u) => [u.uid, u])));
            })
            .finally(() => setLoading(false));
    }, []);

    async function revoke(uid) {
        if (!confirm('Revoke mentorship access?')) return;
        await deleteMentorshipAccess(uid);
        setGrants((prev) => prev.filter((g) => g.uid !== uid));
    }

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? grants
        : grants.filter((grant) => {
              const user = users[grant.uid];
              return [user?.name, user?.email, grant.status, grant.note, grant.uid]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q));
          });

    return (
        <AdminShell
            title="Mentorship access"
            actions={
                <Link href={route('admin.mentorship-access.create')} className="btn-primary">
                    Grant access
                </Link>
            }
        >
            <Head title="Mentorship access" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by name, email, status, or note…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search mentorship access"
                    />

                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            {query.trim() ? 'No access grants match your search.' : 'No mentorship access grants yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((grant) => (
                                <article
                                    key={grant.uid}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <p className="font-medium">{users[grant.uid]?.name || grant.uid}</p>
                                        <p className="text-sm text-slate-400">{users[grant.uid]?.email}</p>
                                        <p className="text-xs text-slate-500">
                                            {grant.status} · {grant.note}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('admin.mentorship-access.edit', grant.uid)}
                                            className="btn-secondary"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-300"
                                            onClick={() => revoke(grant.uid)}
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
