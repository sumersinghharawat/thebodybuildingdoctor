import AdminShell from '@/Components/Admin/AdminShell';
import ThumbnailUploadField from '@/Components/Admin/ThumbnailUploadField';
import VideoUrlField from '@/Components/Admin/VideoUrlField';
import RichTextEditor, { htmlToPlainText } from '@/Components/RichTextEditor';
import { createVaultVideo, fetchVaultVideo, updateVaultVideo } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function VaultForm({ videoId }) {
    const { site } = usePage().props;
    const currency = site?.currency || 'INR';
    const isEdit = Boolean(videoId);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        descriptionHtml: '',
        thumbnailUrl: '',
        videoUrl: '',
        published: false,
        priceCents: 0,
        previewSeconds: 30,
        order: 0,
    });

    useEffect(() => {
        if (!videoId) return;
        fetchVaultVideo(videoId)
            .then((video) => {
                setForm({
                    title: video.title,
                    slug: video.slug,
                    description: video.description,
                    descriptionHtml: video.descriptionHtml || video.description || '',
                    thumbnailUrl: video.thumbnailUrl || '',
                    videoUrl: video.videoUrl || '',
                    published: video.published,
                    priceCents: video.priceCents,
                    previewSeconds: video.previewSeconds || 30,
                    order: video.order,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [videoId]);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!htmlToPlainText(form.descriptionHtml)) {
            setError('Description is required.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const payload = {
                ...form,
                descriptionHtml: form.descriptionHtml,
                description: htmlToPlainText(form.descriptionHtml) || form.description,
            };

            if (isEdit) {
                await updateVaultVideo(videoId, payload);
                router.visit(route('admin.vault.index'));
            } else {
                const created = await createVaultVideo(payload);
                router.visit(route('admin.vault.edit', created.id));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit vault video' : 'New vault video'}>
            <Head title={isEdit ? 'Edit vault video' : 'New vault video'} />
            {loading ? (
                <p className="text-sm text-muted">Loading…</p>
            ) : (
                <form onSubmit={handleSave} className="card-surface max-w-3xl space-y-4 p-6">
                    {error && <p className="text-sm text-red-300">{error}</p>}
                    <div>
                        <label className="label-dark">Title</label>
                        <input
                            className="input-dark"
                            value={form.title}
                            onChange={(e) => updateField('title', e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="label-dark">Slug</label>
                            <input className="input-dark" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} />
                        </div>
                        <div>
                            <label className="label-dark">Price (cents)</label>
                            <input
                                className="input-dark"
                                type="number"
                                min="0"
                                value={form.priceCents}
                                onChange={(e) => updateField('priceCents', Number(e.target.value))}
                            />
                            <p className="mt-1 text-xs text-faint">
                                Displays as {formatPrice(form.priceCents, currency)} ({currency}). Each video is sold on its own.
                            </p>
                        </div>
                        <div>
                            <label className="label-dark">Free preview (seconds)</label>
                            <input
                                className="input-dark"
                                type="number"
                                min="5"
                                max="600"
                                value={form.previewSeconds}
                                onChange={(e) => updateField('previewSeconds', Number(e.target.value))}
                            />
                            <p className="mt-1 text-xs text-faint">Playback stops here until the video is paid and approved. Default is 30 seconds.</p>
                        </div>
                        <div>
                            <label className="label-dark">Sort order</label>
                            <input
                                className="input-dark"
                                type="number"
                                value={form.order}
                                onChange={(e) => updateField('order', Number(e.target.value))}
                            />
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 text-sm text-muted">
                                <input
                                    type="checkbox"
                                    checked={form.published}
                                    onChange={(e) => updateField('published', e.target.checked)}
                                />
                                Published
                            </label>
                        </div>
                    </div>
                    <div>
                        <label className="label-dark">Description</label>
                        <RichTextEditor
                            value={form.descriptionHtml}
                            onChange={(value) => updateField('descriptionHtml', value)}
                            placeholder="What this vault video covers…"
                            minHeight="12rem"
                            required
                        />
                    </div>
                    <VideoUrlField value={form.videoUrl} onChange={(value) => updateField('videoUrl', value)} />
                    <ThumbnailUploadField
                        label="Video thumbnail"
                        folder="vault"
                        value={form.thumbnailUrl}
                        onChange={(value) => updateField('thumbnailUrl', value)}
                    />
                    <p className="-mt-2 text-xs text-faint">
                        This image shows on the Vault cards and on the video before playback starts.
                    </p>
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : isEdit ? 'Save video' : 'Create video'}
                        </button>
                        <Link href={route('admin.vault.index')} className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
