import AdminShell from '@/Components/Admin/AdminShell';
import AdminUserPicker from '@/Components/Admin/AdminUserPicker';
import {
    createVaultPurchase,
    fetchUsers,
    fetchVaultPurchase,
    fetchVaultVideos,
    updateVaultPurchase,
} from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function VaultAccessForm({
    uid,
    videoId,
    prefillUid = '',
    prefillEmail = '',
    returnTo = null,
}) {
    const isEdit = Boolean(uid && videoId);
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [form, setForm] = useState({
        uid: uid || prefillUid || '',
        videoId: videoId || '',
        status: 'active',
        source: 'admin',
        note: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([fetchUsers(), fetchVaultVideos()]).then(([userData, videoData]) => {
            setUsers(userData.users);
            setVideos(videoData.videos);

            if (!isEdit && !prefillUid && prefillEmail) {
                const match = userData.users.find(
                    (user) => user.email.toLowerCase() === prefillEmail.toLowerCase(),
                );
                if (match) {
                    setForm((prev) => ({ ...prev, uid: match.uid }));
                }
            }
        });

        if (isEdit) {
            fetchVaultPurchase(uid, videoId).then((data) => {
                setForm({
                    uid: data.purchase.uid,
                    videoId: data.purchase.videoId,
                    status: data.purchase.status,
                    source: data.purchase.source,
                    note: data.purchase.note || '',
                });
            });
        }
    }, [uid, videoId, isEdit, prefillUid, prefillEmail]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateVaultPurchase(uid, videoId, form);
            } else {
                await createVaultPurchase(form);
            }
            router.visit(returnTo || route('admin.vault-access.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell
            title={isEdit ? 'Edit vault access' : 'Grant vault access'}
            description={
                isEdit
                    ? 'Update status or notes for this video grant.'
                    : 'Pick a member, then choose the vault video to allocate.'
            }
        >
            <Head title="Vault access" />
            <form onSubmit={handleSubmit} className="card-surface max-w-xl space-y-4 p-6">
                {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
                <AdminUserPicker
                    users={users}
                    value={form.uid}
                    onChange={(next) => setForm((p) => ({ ...p, uid: next }))}
                    disabled={isEdit}
                />
                <div>
                    <label className="label-dark">Video</label>
                    <select
                        className="input-dark"
                        value={form.videoId}
                        onChange={(e) => setForm((p) => ({ ...p, videoId: e.target.value }))}
                        required
                        disabled={isEdit}
                    >
                        <option value="">Select video</option>
                        {videos.map((video) => (
                            <option key={video.id} value={video.id}>
                                {video.title}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label-dark">Status</label>
                    <select
                        className="input-dark"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Source</label>
                    <select
                        className="input-dark"
                        value={form.source}
                        onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
                    >
                        <option value="admin">Admin</option>
                        <option value="purchase">Purchase</option>
                    </select>
                </div>
                <div>
                    <label className="label-dark">Note</label>
                    <input
                        className="input-dark"
                        value={form.note}
                        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                    />
                </div>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={returnTo || route('admin.vault-access.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
