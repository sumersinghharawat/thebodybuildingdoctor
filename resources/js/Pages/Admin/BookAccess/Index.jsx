import AdminShell from '@/Components/Admin/AdminShell';
import { deleteBookPurchase, fetchBookPurchases, updateBookPurchase } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BookAccessIndex() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchBookPurchases()
            .then((data) => setPurchases(data.purchases))
            .finally(() => setLoading(false));
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? purchases
        : purchases.filter((purchase) =>
              [purchase.userName, purchase.userEmail, purchase.bookTitle, purchase.status, purchase.note]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q)),
          );

    async function setStatus(purchase, status) {
        await updateBookPurchase(purchase.uid, purchase.bookId, { status });
        setPurchases((prev) =>
            prev.map((item) =>
                item.uid === purchase.uid && item.bookId === purchase.bookId ? { ...item, status } : item,
            ),
        );
    }

    async function revoke(purchase) {
        if (!confirm('Revoke book access?')) return;
        await deleteBookPurchase(purchase.uid, purchase.bookId);
        setPurchases((prev) =>
            prev.filter((item) => !(item.uid === purchase.uid && item.bookId === purchase.bookId)),
        );
    }

    return (
        <AdminShell
            title="Book access"
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
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by user, book, or status…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search book access"
                    />
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted">
                            {query.trim() ? 'No access records match your search.' : 'No book access records yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((purchase) => (
                                <article
                                    key={`${purchase.uid}_${purchase.bookId}`}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <p className="font-medium">{purchase.userName || purchase.uid}</p>
                                        <p className="text-sm text-muted">{purchase.userEmail}</p>
                                        <p className="text-sm text-muted">{purchase.bookTitle || purchase.bookId}</p>
                                        <p className="text-xs text-faint">
                                            {purchase.status} · {purchase.source}
                                            {purchase.note ? ` · ${purchase.note}` : ''}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
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
                                            href={route('admin.book-access.edit', [purchase.uid, purchase.bookId])}
                                            className="btn-secondary"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-300"
                                            onClick={() => revoke(purchase)}
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
