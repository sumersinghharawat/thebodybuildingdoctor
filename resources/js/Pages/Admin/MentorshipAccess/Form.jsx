import AdminShell from '@/Components/Admin/AdminShell';
import AdminUserPicker from '@/Components/Admin/AdminUserPicker';
import { fetchMentorshipAccess, fetchUsers, grantMentorshipAccess, updateMentorshipAccess } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MentorshipAccessForm({ uid }) {
    const isEdit = Boolean(uid);
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ uid: uid || '', status: 'active', note: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers().then((data) => setUsers(data.users));
        if (uid) {
            fetchMentorshipAccess(uid).then((data) => {
                setForm({
                    uid: data.mentorshipAccess.uid,
                    status: data.mentorshipAccess.status,
                    note: data.mentorshipAccess.note || '',
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
                await updateMentorshipAccess(uid, form);
            } else {
                await grantMentorshipAccess(form);
            }
            router.visit(route('admin.mentorship-access.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell
            title={isEdit ? 'Edit mentorship access' : 'Grant mentorship access'}
            description={isEdit ? 'Update this member’s mentorship grant.' : 'Find a member and grant mentorship library access.'}
        >
            <Head title="Mentorship access" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
                <AdminUserPicker
                    users={users}
                    value={form.uid}
                    onChange={(next) => setForm((p) => ({ ...p, uid: next }))}
                    disabled={isEdit}
                />
                <div>
                    <label className="label-dark">Status</label>
                    <select
                        className="input-dark"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    >
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Note</label>
                    <textarea
                        className="input-dark"
                        rows={3}
                        value={form.note}
                        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={route('admin.mentorship-access.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
