import AdminShell from '@/Components/Admin/AdminShell';
import { deleteBlogAccess, fetchBlogAccessList, fetchUsers } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BlogAccessIndex() {
    const [grants, setGrants] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchBlogAccessList(), fetchUsers()]).then(([grantData, userData]) => {
            setGrants(grantData.blogAccess || []);
            setUsers(Object.fromEntries(userData.users.map((u) => [u.uid, u])));
        }).finally(() => setLoading(false));
    }, []);

    async function revoke(uid) {
        if (!confirm('Revoke blog access?')) return;
        await deleteBlogAccess(uid);
        setGrants((prev) => prev.filter((g) => g.uid !== uid));
    }

    return (
        <AdminShell
            title="Blog access"
            actions={
                <Link href={route('admin.blog-access.create')} className="btn-primary">
                    Grant access
                </Link>
            }
        >
            <Head title="Blog access" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    {grants.map((grant) => (
                        <article key={grant.uid} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium">{users[grant.uid]?.name || grant.uid}</p>
                                <p className="text-sm text-slate-400">{users[grant.uid]?.email}</p>
                                <p className="text-xs text-slate-500">{grant.status} · {grant.note}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('admin.blog-access.edit', grant.uid)} className="btn-secondary">
                                    Edit
                                </Link>
                                <button type="button" className="btn-secondary text-red-300" onClick={() => revoke(grant.uid)}>
                                    Revoke
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AdminShell>
    );
}
