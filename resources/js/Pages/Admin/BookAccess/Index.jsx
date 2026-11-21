import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteBookPurchase, fetchBookPurchases, updateBookPurchase } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function groupByUser(purchases) {
    const groups = new Map();

    for (const purchase of purchases) {
        const key = purchase.uid;
        if (!groups.has(key)) {
            groups.set(key, {
                uid: purchase.uid,
                name: purchase.userName || purchase.uid,
                email: purchase.userEmail || '',
                purchases: [],
            });
        }
        groups.get(key).purchases.push(purchase);
    }

    return [...groups.values()]
        .map((group) => ({
            ...group,
            pendingCount: group.purchases.filter((item) => item.status === 'pending').length,
            purchases: [...group.purchases].sort((a, b) =>
                String(a.bookTitle || a.bookId).localeCompare(String(b.bookTitle || b.bookId)),
            ),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export default function BookAccessIndex() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(() => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get('q') || '';
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        fetchBookPurchases()
            .then((data) => setPurchases(data.purchases))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return purchases.filter((purchase) => {
            if (statusFilter !== 'all' && purchase.status !== statusFilter) return false;
            if (!q) return true;
            return [purchase.userName, purchase.userEmail, purchase.bookTitle, purchase.status, purchase.note]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [purchases, query, statusFilter]);

    const groups = useMemo(() => groupByUser(filtered), [filtered]);

    useEffect(() => {
        if (!query.trim() && statusFilter === 'all') return;
        const next = {};
        for (const group of groups) next[group.uid] = true;
        setExpanded(next);
    }, [query, statusFilter, groups]);

    const counts = useMemo(() => ({
        all: purchases.length,
        pending: purchases.filter((item) => item.status === 'pending').length,
        active: purchases.filter((item) => item.status === 'active').length,
        revoked: purchases.filter((item) => item.status === 'revoked').length,
    }), [purchases]);

    async function setStatus(purchase, status) {
        await updateBookPurchase(purchase.uid, purchase.bookId, { status });
        setPurchases((prev) =>
            prev.map((item) =>
                item.uid === purchase.uid && item.bookId === purchase.bookId ? { ...item, status } : item,
            ),
        );
    }

    async function revoke(purchase) {
        if (!confirm(`Revoke access to "${purchase.bookTitle || purchase.bookId}"?`)) return;
        await deleteBookPurchase(purchase.uid, purchase.bookId);
        setPurchases((prev) =>
            prev.filter((item) => !(item.uid === purchase.uid && item.bookId === purchase.bookId)),
        );
    }

    function grantMore(uid) {
        const params = new URLSearchParams({ uid, returnTo: route('admin.book-access.index') });
        router.visit(`${route('admin.book-access.create')}?${params}`);
    }

    return (
        <AdminShell
            title="Book access"
            description="Approve payments and manage each member’s book library."
            actions={
                <Link href={route('admin.book-access.create')} className="btn-primary">
                    Grant access
                </Link>
            }
        >
            <Head title="Book access" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search member, email, or book…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'pending', label: 'Pending', count: counts.pending },
                            { value: 'active', label: 'Active', count: counts.active },
                            { value: 'revoked', label: 'Revoked', count: counts.revoked },
                        ]}
                        resultLabel={`${groups.length} member${groups.length === 1 ? '' : 's'} · ${filtered.length} book${filtered.length === 1 ? '' : 's'}`}
                    />

                    {groups.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No records match' : 'No book access yet'}
                            description="When members request books, approve them here grouped by user."
                        />
                    ) : (
                        <div className="space-y-3">
                            {groups.map((group) => {
                                const open = Boolean(expanded[group.uid]);
                                return (
                                    <section key={group.uid} className="card-surface overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setExpanded((prev) => ({ ...prev, [group.uid]: !prev[group.uid] }))
                                            }
                                            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-surface-hover/50"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">{group.name}</p>
                                                    <span className="pill">
                                                        {group.purchases.length} book
                                                        {group.purchases.length === 1 ? '' : 's'}
                                                    </span>
                                                    {group.pendingCount > 0 && (
                                                        <span className="text-xs text-amber-700 dark:text-amber-300">
                                                            {group.pendingCount} pending
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
                                                        Add book
                                                    </button>
                                                    <Link
                                                        href={route('admin.users.edit', group.uid)}
                                                        className="btn-secondary"
                                                    >
                                                        Edit user
                                                    </Link>
                                                </div>
                                                <ul className="divide-y divide-edge border-t border-edge">
                                                    {group.purchases.map((purchase) => (
                                                        <li
                                                            key={`${purchase.uid}_${purchase.bookId}`}
                                                            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="font-medium">
                                                                    {purchase.bookTitle || purchase.bookId}
                                                                </p>
                                                                <p className="mt-1 text-xs text-faint">
                                                                    {purchase.source}
                                                                    {purchase.note ? ` · ${purchase.note}` : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <StatusBadge status={purchase.status} />
                                                                {purchase.status !== 'active' && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn-primary"
                                                                        onClick={() => setStatus(purchase, 'active')}
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={route('admin.book-access.edit', [
                                                                        purchase.uid,
                                                                        purchase.bookId,
                                                                    ])}
                                                                    className="btn-secondary"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="btn-secondary text-red-600 dark:text-red-300"
                                                                    onClick={() => revoke(purchase)}
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
