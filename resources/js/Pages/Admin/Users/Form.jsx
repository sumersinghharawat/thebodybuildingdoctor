import AdminShell from '@/Components/Admin/AdminShell';
import { createUser, fetchUser, updateUser } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const ROLE_OPTIONS = ['administrator', 'lms_manager', 'media_channel'];

export default function UserForm({ uid, prefill = {}, returnTo = null, afterCreate = null }) {
    const isEdit = Boolean(uid);
    const [form, setForm] = useState({
        name: prefill.name || '',
        email: prefill.email || '',
        password: '',
        roles: ['media_channel'],
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!uid) return;
        fetchUser(uid).then((user) => {
            setForm({
                name: user.name,
                email: user.email,
                password: '',
                roles: user.roles || ['media_channel'],
            });
        });
    }, [uid]);

    function toggleRole(role) {
        setForm((prev) => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter((r) => r !== role)
                : [...prev.roles, role],
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateUser(uid, form);
                router.visit(returnTo || route('admin.users.index'));
            } else {
                await createUser(form);
                router.visit(afterCreate || returnTo || route('admin.users.index'));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit user' : 'New user'}>
            <Head title="User" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div>
                    <label className="label-dark">Name</label>
                    <input className="input-dark" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                    <label className="label-dark">Email</label>
                    <input className="input-dark" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
                </div>
                <div>
                    <label className="label-dark">{isEdit ? 'New password (optional)' : 'Password'}</label>
                    <input className="input-dark" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required={!isEdit} />
                </div>
                <div>
                    <label className="label-dark">Roles</label>
                    <div className="flex flex-wrap gap-3">
                        {ROLE_OPTIONS.map((role) => (
                            <label key={role} className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                                {role}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={returnTo || route('admin.users.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
