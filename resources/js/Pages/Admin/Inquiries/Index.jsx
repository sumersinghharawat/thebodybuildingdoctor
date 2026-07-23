import AdminShell from '@/Components/Admin/AdminShell';
import { fetchInquiries, updateInquiry } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function sortInquiries(items) {
    return [...items].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (bTime !== aTime) {
            return bTime - aTime;
        }

        return String(b.id).localeCompare(String(a.id));
    });
}

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
}

function enrollUrl(inquiry) {
    const params = new URLSearchParams();
    if (inquiry.email) params.set('email', inquiry.email);
    if (inquiry.courseId) params.set('courseId', inquiry.courseId);
    params.set('returnTo', route('admin.inquiries.index'));

    return `${route('admin.enrollments.create')}?${params}`;
}

function createUserUrl(inquiry) {
    const params = new URLSearchParams();
    if (inquiry.email) params.set('email', inquiry.email);
    if (inquiry.name) params.set('name', inquiry.name);
    params.set('returnTo', route('admin.inquiries.index'));

    const enrollParams = new URLSearchParams();
    if (inquiry.email) enrollParams.set('email', inquiry.email);
    if (inquiry.courseId) enrollParams.set('courseId', inquiry.courseId);
    params.set('afterCreate', `${route('admin.enrollments.create')}?${enrollParams}`);

    return `${route('admin.users.create')}?${params}`;
}

export default function InquiriesIndex() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchInquiries()
            .then((data) => setInquiries(sortInquiries(data.inquiries)))
            .finally(() => setLoading(false));
    }, []);

    async function setStatus(inquiry, status) {
        await updateInquiry(inquiry.id, { status });
        setInquiries((prev) =>
            sortInquiries(prev.map((item) => (item.id === inquiry.id ? { ...item, status } : item))),
        );
    }

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? inquiries
        : inquiries.filter((inquiry) =>
              [inquiry.name, inquiry.email, inquiry.phone, inquiry.message, inquiry.courseTitle, inquiry.status]
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q)),
          );

    return (
        <AdminShell title="Inquiries">
            <Head title="Inquiries" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by name, email, course, or status…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search inquiries"
                    />

                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            {query.trim() ? 'No inquiries match your search.' : 'No inquiries yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((inquiry) => (
                                <article key={inquiry.id} className="card-surface space-y-3 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium">{inquiry.name}</p>
                                            <p className="text-sm text-slate-400">{inquiry.email}</p>
                                            {inquiry.phone && <p className="text-xs text-slate-500">{inquiry.phone}</p>}
                                            {inquiry.createdAt && (
                                                <p className="mt-1 text-xs text-slate-500">{formatDate(inquiry.createdAt)}</p>
                                            )}
                                        </div>
                                        <select
                                            className="input-dark w-auto"
                                            value={inquiry.status}
                                            onChange={(e) => setStatus(inquiry, e.target.value)}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    {inquiry.message && <p className="text-sm text-slate-300">{inquiry.message}</p>}
                                    {inquiry.courseTitle && (
                                        <p className="text-xs text-slate-500">Course: {inquiry.courseTitle}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Link href={createUserUrl(inquiry)} className="btn-secondary text-sm">
                                            Create user
                                        </Link>
                                        <Link href={enrollUrl(inquiry)} className="btn-primary text-sm">
                                            Grant enrollment
                                        </Link>
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
