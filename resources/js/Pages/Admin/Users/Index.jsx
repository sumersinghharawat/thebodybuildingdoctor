import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState } from '@/Components/Admin/AdminListControls';
import { deleteUser, fetchUsers } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function roleBucket(roles = []) {
    if (roles.some((r) => ['administrator', 'admin', 'lms_manager'].includes(r))) return 'admin';
    if (roles.includes('media_channel')) return 'member';
    return 'other';
}

export default function UsersIndex() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers()
            .then((data) => setUsers(data.users))
            .finally(() => setLoading(false));
    }, []);

    const counts = useMemo(() => {
        const admin = users.filter((user) => roleBucket(user.roles) === 'admin').length;
        const member = users.filter((user) => roleBucket(user.roles) === 'member').length;
        return {
            all: users.length,
            admin,
            member,
            other: users.length - admin - member,
        };
    }, [users]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return users
            .filter((user) => {
                if (roleFilter !== 'all' && roleBucket(user.roles) !== roleFilter) return false;
                if (!q) return true;
                return [user.name, user.email, ...(user.roles || [])]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }, [users, query, roleFilter]);

    async function handleDelete(user) {
        if (!confirm(`Delete user ${user.email}?`)) return;
        await deleteUser(user.uid);
        setUsers((prev) => prev.filter((item) => item.uid !== user.uid));
    }

    return (
        <AdminShell
            title="Users"
            description="Search members quickly, then jump to their enrollments or book access."
            actions={
                <Link href={route('admin.users.create')} className="btn-primary">
                    New user
                </Link>
            }
        >
            <Head title="Users" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by name, email, or role…"
                        filter={roleFilter}
                        onFilterChange={setRoleFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'member', label: 'Members', count: counts.member },
                            { value: 'admin', label: 'Admins', count: counts.admin },
                            ...(counts.other > 0
                                ? [{ value: 'other', label: 'Other', count: counts.other }]
                                : []),
                        ]}
                        resultLabel={`${filtered.length} user${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || roleFilter !== 'all' ? 'No users match' : 'No users found'}
                            description="Create a member account to grant course or book access."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-edge">
                            <div className="hidden grid-cols-[1.4fr_1.6fr_1fr_auto] gap-3 border-b border-edge bg-surface/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-faint md:grid">
                                <span>Name</span>
                                <span>Email</span>
                                <span>Role</span>
                                <span className="text-right">Actions</span>
                            </div>
                            <ul className="divide-y divide-edge">
                                {filtered.map((user) => (
                                    <li
                                        key={user.uid}
                                        className="grid gap-3 px-4 py-3 md:grid-cols-[1.4fr_1.6fr_1fr_auto] md:items-center"
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">{user.name}</p>
                                            <p className="text-xs text-faint md:hidden">{user.email}</p>
                                        </div>
                                        <p className="hidden truncate text-sm text-muted md:block">{user.email}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(user.roles || []).length === 0 ? (
                                                <span className="text-xs text-faint">No roles</span>
                                            ) : (
                                                user.roles.map((role) => (
                                                    <span key={role} className="pill normal-case tracking-normal">
                                                        {role}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:justify-end">
                                            <Link
                                                href={`${route('admin.enrollments.index')}?q=${encodeURIComponent(user.email || user.name)}`}
                                                className="btn-secondary"
                                            >
                                                Enrollments
                                            </Link>
                                            <Link
                                                href={`${route('admin.book-access.index')}?q=${encodeURIComponent(user.email || user.name)}`}
                                                className="btn-secondary"
                                            >
                                                Books
                                            </Link>
                                            <Link
                                                href={route('admin.users.edit', user.uid)}
                                                className="btn-secondary"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn-secondary text-red-600 dark:text-red-300"
                                                onClick={() => handleDelete(user)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
