import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { fetchInquiries, updateInquiry } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

function sortInquiries(items) {
    return [...items].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (bTime !== aTime) return bTime - aTime;
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

function bookAccessUrl(inquiry) {
    const params = new URLSearchParams();
    if (inquiry.email) params.set('email', inquiry.email);
    if (inquiry.courseId) params.set('bookId', inquiry.courseId);
    params.set('returnTo', route('admin.inquiries.index'));
    return `${route('admin.book-access.create')}?${params}`;
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
    const [statusFilter, setStatusFilter] = useState('new');

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

    const counts = useMemo(() => ({
        all: inquiries.length,
        new: inquiries.filter((item) => item.status === 'new').length,
        contacted: inquiries.filter((item) => item.status === 'contacted').length,
        closed: inquiries.filter((item) => item.status === 'closed').length,
    }), [inquiries]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return inquiries.filter((inquiry) => {
            if (statusFilter !== 'all' && inquiry.status !== statusFilter) return false;
            if (!q) return true;
            return [inquiry.name, inquiry.email, inquiry.phone, inquiry.message, inquiry.courseTitle, inquiry.status, inquiry.type]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [inquiries, query, statusFilter]);

    return (
        <AdminShell title="Inquiries" description="Triage landing-page requests, then create users or grant access.">
            <Head title="Inquiries" />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by name, email, course, or message…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'new', label: 'New', count: counts.new },
                            { value: 'contacted', label: 'Contacted', count: counts.contacted },
                            { value: 'closed', label: 'Closed', count: counts.closed },
                            { value: 'all', label: 'All', count: counts.all },
                        ]}
                        resultLabel={`${filtered.length} inquir${filtered.length === 1 ? 'y' : 'ies'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No inquiries match' : 'No inquiries yet'}
                            description="New access requests from the landing page will show up here."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((inquiry) => (
                                <article key={inquiry.id} className="card-surface space-y-3 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-semibold">{inquiry.name}</p>
                                                <StatusBadge status={inquiry.status} />
                                                {inquiry.type && (
                                                    <span className="pill normal-case tracking-normal">
                                                        {inquiry.type === 'books' ? 'Book' : 'Course'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-sm text-muted">{inquiry.email}</p>
                                            {inquiry.phone && <p className="text-xs text-faint">{inquiry.phone}</p>}
                                            {inquiry.createdAt && (
                                                <p className="mt-1 text-xs text-faint">{formatDate(inquiry.createdAt)}</p>
                                            )}
                                        </div>
                                        <select
                                            className="input-dark w-auto"
                                            value={inquiry.status}
                                            onChange={(e) => setStatus(inquiry, e.target.value)}
                                            aria-label="Inquiry status"
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    {inquiry.message && <p className="text-sm text-muted">{inquiry.message}</p>}
                                    {inquiry.courseTitle && (
                                        <p className="text-xs text-faint">
                                            {inquiry.type === 'books' ? 'Book' : 'Course'}: {inquiry.courseTitle}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Link href={createUserUrl(inquiry)} className="btn-secondary text-sm">
                                            Create user
                                        </Link>
                                        {inquiry.type === 'books' ? (
                                            <Link href={bookAccessUrl(inquiry)} className="btn-primary text-sm">
                                                Grant book access
                                            </Link>
                                        ) : (
                                            <Link href={enrollUrl(inquiry)} className="btn-primary text-sm">
                                                Grant enrollment
                                            </Link>
                                        )}
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
