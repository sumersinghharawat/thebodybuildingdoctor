import AdminShell from '@/Components/Admin/AdminShell';
import { deleteUser, fetchUsers, issueFaceEnrollLink } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function UsersIndex() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [linkingUid, setLinkingUid] = useState(null);

    useEffect(() => {
        fetchUsers()
            .then((data) => setUsers(data.users))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(user) {
        if (!confirm(`Delete user ${user.email}?`)) return;
        await deleteUser(user.uid);
        setUsers((prev) => prev.filter((item) => item.uid !== user.uid));
    }

    async function handleFaceLink(user) {
        setLinkingUid(user.uid);

        try {
            const data = await issueFaceEnrollLink(user.uid);
            await navigator.clipboard.writeText(data.url);
            alert(`Face enrollment link copied for ${user.email}.\n\nExpires: ${new Date(data.expiresAt).toLocaleString()}`);
        } catch (err) {
            alert(err.message || 'Could not generate enrollment link.');
        } finally {
            setLinkingUid(null);
        }
    }

    return (
        <AdminShell
            title="Users"
            actions={
                <Link href={route('admin.users.create')} className="btn-primary">
                    New user
                </Link>
            }
        >
            <Head title="Users" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    {users.map((user) => (
                        <article key={user.uid} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-slate-400">{user.email}</p>
                                <p className="text-xs text-slate-500">{user.roles?.join(', ')}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Face lock:{' '}
                                    {user.hasFaceRegistered ? (
                                        <span className="text-emerald-300">Enrolled</span>
                                    ) : (
                                        <span>Not enrolled</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={linkingUid === user.uid}
                                    onClick={() => handleFaceLink(user)}
                                >
                                    {linkingUid === user.uid ? 'Generating…' : 'Face link'}
                                </button>
                                <Link href={route('admin.users.edit', user.uid)} className="btn-secondary">
                                    Edit
                                </Link>
                                <button type="button" className="btn-secondary text-red-300" onClick={() => handleDelete(user)}>
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </AdminShell>
    );
}
