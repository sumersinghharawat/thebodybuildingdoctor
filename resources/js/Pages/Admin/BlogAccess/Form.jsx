import AdminShell from '@/Components/Admin/AdminShell';
import { fetchBlogAccess, fetchUsers, grantBlogAccess, updateBlogAccess } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BlogAccessForm({ uid }) {
    const isEdit = Boolean(uid);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ uid: uid || '', status: 'active', note: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers().then((data) => setUsers(data.users));
        if (uid) {
            fetchBlogAccess(uid).then((data) => {
                setForm({
                    uid: data.blogAccess.uid,
                    status: data.blogAccess.status,
                    note: data.blogAccess.note || '',
                });
            });
        }
    }, [uid]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateBlogAccess(uid, form);
            } else {
                await grantBlogAccess(form);
            }
            router.visit(route('admin.blog-access.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit blog access' : 'Grant blog access'}>
            <Head title="Blog access" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div>
                    <label className="label-dark">User</label>
                    <select className="input-dark" value={form.uid} onChange={(e) => setForm((p) => ({ ...p, uid: e.target.value }))} required disabled={isEdit}>
                        <option value="">Select user</option>
                        {users.map((user) => (
                            <option key={user.uid} value={user.uid}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Status</label>
                    <select className="input-dark" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Note</label>
                    <textarea className="input-dark" rows={3} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={route('admin.blog-access.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
