import AdminShell from '@/Components/Admin/AdminShell';
import { fetchInquiries, updateInquiry } from '@/lib/admin-api';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function InquiriesIndex() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInquiries()
            .then((data) => setInquiries(data.inquiries))
            .finally(() => setLoading(false));
    }, []);

    async function setStatus(inquiry, status) {
        await updateInquiry(inquiry.id, { status });
        setInquiries((prev) => prev.map((item) => (item.id === inquiry.id ? { ...item, status } : item)));
    }

    return (
        <AdminShell title="Inquiries">
            <Head title="Inquiries" />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-3">
                    {inquiries.map((inquiry) => (
                        <article key={inquiry.id} className="card-surface space-y-3 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <p className="font-medium">{inquiry.name}</p>
                                    <p className="text-sm text-slate-400">{inquiry.email}</p>
                                    {inquiry.phone && <p className="text-xs text-slate-500">{inquiry.phone}</p>}
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
                        </article>
                    ))}
                    {inquiries.length === 0 && <p className="text-sm text-slate-400">No inquiries yet.</p>}
                </div>
            )}
        </AdminShell>
    );
}
