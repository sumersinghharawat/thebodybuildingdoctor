import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteMentorship, fetchMentorship } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function MentorshipIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMentorship()
            .then((data) => setItems(data.mentorship))
            .finally(() => setLoading(false));
    }, []);

    async function handleDelete(item) {
        if (!confirm(`Delete "${item.title}"?`)) return;
        await deleteMentorship(item.id);
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    }

    const counts = useMemo(() => ({
        all: items.length,
        published: items.filter((item) => item.published).length,
        draft: items.filter((item) => !item.published).length,
    }), [items]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items
            .filter((item) => {
                if (statusFilter === 'published' && !item.published) return false;
                if (statusFilter === 'draft' && item.published) return false;
                if (!q) return true;
                return [item.title, item.authorName, item.published ? 'published' : 'draft']
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }, [items, query, statusFilter]);

    return (
        <AdminShell
            title="Mentorship"
            description="Publish mentorship lectures and case labs."
            actions={
                <Link href={route('admin.mentorship.create')} className="btn-primary">
                    New mentorship content
                </Link>
            }
        >
            <Head title="Mentorship" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by title or author…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'published', label: 'Published', count: counts.published },
                            { value: 'draft', label: 'Draft', count: counts.draft },
                        ]}
                        resultLabel={`${filtered.length} item${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No content match' : 'No mentorship content yet'}
                            description="Add lectures or case labs, then grant members access separately."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((item) => (
                                <article
                                    key={item.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{item.title}</p>
                                            <StatusBadge status={item.published ? 'published' : 'draft'} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted">{item.authorName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.mentorship.edit', item.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-600 dark:text-red-300"
                                            onClick={() => handleDelete(item)}
                                        >
                                            Delete
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
