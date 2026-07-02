import AdminShell from '@/Components/Admin/AdminShell';
import { deleteMentorship, fetchMentorship } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MentorshipIndex() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="space-y-3">
                    {items.map((item) => (
                        <article key={item.id} className="card-surface flex flex-wrap items-center justify-between gap-4 p-4">
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
                                <button type="button" className="btn-secondary text-red-300" onClick={() => handleDelete(item)}>
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
