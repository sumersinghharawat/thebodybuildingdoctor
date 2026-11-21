import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleString();
}

export default function SupportIndex({ tickets = [] }) {
    const { flash } = usePage().props;
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('open');

    const counts = useMemo(
        () => ({
            all: tickets.length,
            open: tickets.filter((item) => item.status === 'open').length,
            in_progress: tickets.filter((item) => item.status === 'in_progress').length,
            resolved: tickets.filter((item) => item.status === 'resolved').length,
        }),
        [tickets],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return tickets.filter((ticket) => {
            if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
            if (!q) return true;
            return [ticket.name, ticket.email, ticket.subject, ticket.message, ticket.status]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
        });
    }, [tickets, query, statusFilter]);

    function setStatus(ticket, status) {
        router.patch(route('admin.support.update', ticket.id), { status }, { preserveScroll: true });
    }

    return (
        <AdminShell title="Technical support" description="Review member issues, reply by email, and mark tickets resolved.">
            <Head title="Technical support" />
            {flash?.success && (
                <p className="mb-4 rounded-lg border border-emerald-900/50 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                    {flash.success}
                </p>
            )}
            <div className="space-y-5">
                <AdminListToolbar
                    query={query}
                    onQueryChange={setQuery}
                    placeholder="Search by name, email, or subject…"
                    filter={statusFilter}
                    onFilterChange={setStatusFilter}
                    filterOptions={[
                        { value: 'open', label: 'Open', count: counts.open },
                        { value: 'in_progress', label: 'In progress', count: counts.in_progress },
                        { value: 'resolved', label: 'Resolved', count: counts.resolved },
                        { value: 'all', label: 'All', count: counts.all },
                    ]}
                    resultLabel={`${filtered.length} ticket${filtered.length === 1 ? '' : 's'}`}
                />

                {filtered.length === 0 ? (
                    <EmptyState
                        title={query.trim() || statusFilter !== 'all' ? 'No tickets match' : 'No support tickets yet'}
                        description="New technical support requests from the website will show up here."
                    />
                ) : (
                    <div className="space-y-3">
                        {filtered.map((ticket) => (
                            <article key={ticket.id} className="card-surface space-y-3 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={route('admin.support.show', ticket.id)}
                                                className="font-semibold hover:underline"
                                            >
                                                {ticket.subject}
                                            </Link>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                        <p className="mt-1 text-sm text-muted">
                                            {ticket.name} · {ticket.email}
                                        </p>
                                        {ticket.createdAt && (
                                            <p className="mt-1 text-xs text-faint">{formatDate(ticket.createdAt)}</p>
                                        )}
                                    </div>
                                    <select
                                        className="input-dark w-auto"
                                        value={ticket.status}
                                        onChange={(e) => setStatus(ticket, e.target.value)}
                                        aria-label="Ticket status"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                <p className="line-clamp-3 text-sm text-muted">{ticket.message}</p>
                                <p className="text-xs text-faint">
                                    {ticket.attachmentCount || 0} attachment
                                    {(ticket.attachmentCount || 0) === 1 ? '' : 's'}
                                    {' · '}
                                    {ticket.replyCount || 0} {(ticket.replyCount || 0) === 1 ? 'reply' : 'replies'}
                                </p>
                                <Link href={route('admin.support.show', ticket.id)} className="btn-primary text-sm">
                                    Open ticket
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
