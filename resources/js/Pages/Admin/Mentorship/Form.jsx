import AdminShell from '@/Components/Admin/AdminShell';
import PdfUploadField from '@/Components/Admin/PdfUploadField';
import RichTextEditor, { htmlToPlainText } from '@/Components/RichTextEditor';
import { createMentorship, fetchMentorshipItem, updateMentorship, uploadThumbnail } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function MentorshipForm({ mentorshipId }) {
    const isEdit = Boolean(mentorshipId);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        contentHtml: '',
        thumbnailUrl: '',
        pdfUrl: '',
        authorName: 'The Bodybuilding Doctor',
        published: false,
        order: 0,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!mentorshipId) return;
        fetchMentorshipItem(mentorshipId).then((data) => {
            const item = data.mentorship;
            setForm({
                title: item.title,
                slug: item.slug,
                excerpt: item.excerpt,
                contentHtml: item.contentHtml,
                thumbnailUrl: item.thumbnailUrl || '',
                pdfUrl: item.pdfUrl || '',
                authorName: item.authorName,
                published: item.published,
                order: item.order,
            });
        });
    }, [mentorshipId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('Title is required.');
            return;
        }
        if (!htmlToPlainText(form.contentHtml)) {
            setError('Content is required.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateMentorship(mentorshipId, form);
            } else {
                await createMentorship(form);
            }
            router.visit(route('admin.mentorship.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleThumbnail(file) {
        const { url } = await uploadThumbnail(file, 'mentorship');
        setForm((p) => ({ ...p, thumbnailUrl: url }));
    }

    return (
        <AdminShell title={isEdit ? 'Edit mentorship content' : 'New mentorship content'}>
            <Head title="Mentorship" />
            <form onSubmit={handleSubmit} className="card-surface max-w-3xl space-y-4 p-6">
                {error && <p className="text-sm text-red-300">{error}</p>}
                <div>
                    <label className="label-dark">Title</label>
                    <input className="input-dark" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
                </div>
                <div>
                    <label className="label-dark">Slug</label>
                    <input className="input-dark" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} />
                </div>
                <div>
                    <label className="label-dark">Excerpt</label>
                    <textarea className="input-dark" rows={2} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} />
                </div>
                <div>
                    <label className="label-dark">Content</label>
                    <RichTextEditor
                        value={form.contentHtml}
                        onChange={(value) => setForm((p) => ({ ...p, contentHtml: value }))}
                        placeholder="Write the mentorship lecture, case study, or coaching notes…"
                        minHeight="18rem"
                        required
                    />
                </div>
                <div>
                    <label className="label-dark">Thumbnail URL</label>
                    <input className="input-dark" value={form.thumbnailUrl} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} />
                    <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
                </div>
                <PdfUploadField
                    label="Mentorship PDF"
                    value={form.pdfUrl}
                    onChange={(value) => setForm((p) => ({ ...p, pdfUrl: value }))}
                    folder="mentorship"
                />
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
                    Published
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={route('admin.mentorship.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
