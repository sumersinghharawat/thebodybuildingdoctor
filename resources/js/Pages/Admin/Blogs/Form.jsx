import AdminShell from '@/Components/Admin/AdminShell';
import { createBlog, fetchBlog, updateBlog, uploadThumbnail } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BlogForm({ blogId }) {
    const isEdit = Boolean(blogId);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        contentHtml: '',
        thumbnailUrl: '',
        authorName: 'The Bodybuilding Doctor',
        published: false,
        order: 0,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!blogId) return;
        fetchBlog(blogId).then((data) => {
            const blog = data.blog;
            setForm({
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                contentHtml: blog.contentHtml,
                thumbnailUrl: blog.thumbnailUrl || '',
                authorName: blog.authorName,
                published: blog.published,
                order: blog.order,
            });
        });
    }, [blogId]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) {
                await updateBlog(blogId, form);
            } else {
                await createBlog(form);
            }
            router.visit(route('admin.blogs.index'));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleThumbnail(file) {
        const { url } = await uploadThumbnail(file, 'blogs');
        setForm((p) => ({ ...p, thumbnailUrl: url }));
    }

    return (
        <AdminShell title={isEdit ? 'Edit mentorship content' : 'New mentorship content'}>
            <Head title="Blog" />
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
                    <label className="label-dark">Content HTML</label>
                    <textarea className="input-dark font-mono text-xs" rows={12} value={form.contentHtml} onChange={(e) => setForm((p) => ({ ...p, contentHtml: e.target.value }))} />
                </div>
                <div>
                    <label className="label-dark">Thumbnail URL</label>
                    <input className="input-dark" value={form.thumbnailUrl} onChange={(e) => setForm((p) => ({ ...p, thumbnailUrl: e.target.value }))} />
                    <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
                    Published
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                    <Link href={route('admin.blogs.index')} className="btn-secondary">
                        Cancel
                    </Link>
                </div>
            </form>
        </AdminShell>
    );
}
