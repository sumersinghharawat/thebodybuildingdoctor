import AdminShell from '@/Components/Admin/AdminShell';
import { deleteMentorship, fetchMentorship } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MentorshipIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

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

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? items
        : items.filter((item) =>
              [item.title, item.authorName, item.published ? 'published' : 'draft']
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q)),
          );

    return (
        <AdminShell
            title="Mentorship"
            actions={
                <Link href={route('admin.mentorship.create')} className="btn-primary">
                    New mentorship content
                </Link>
            }
        >
            <Head title="Mentorship" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by title, author, or status…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search mentorship"
                    />

                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            {query.trim() ? 'No mentorship content matches your search.' : 'No mentorship content yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((item) => (
                                <article
                                    key={item.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <p className="font-medium">{item.title}</p>
                                        <p className="text-xs text-slate-400">
                                            {item.published ? 'Published' : 'Draft'} · {item.authorName}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={route('admin.mentorship.edit', item.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-300"
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
