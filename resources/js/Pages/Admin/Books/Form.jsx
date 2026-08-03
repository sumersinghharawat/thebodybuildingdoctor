import AdminShell from '@/Components/Admin/AdminShell';
import RichTextEditor, { htmlToPlainText } from '@/Components/RichTextEditor';
import { createBook, fetchBook, updateBook, uploadPdf, uploadThumbnail } from '@/lib/admin-api';
import { formatPrice } from '@/lib/format';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BookForm({ bookId }) {
    const { site } = usePage().props;
    const currency = site?.currency || 'INR';
    const isEdit = Boolean(bookId);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        descriptionHtml: '',
        thumbnailUrl: '',
        pdfPath: '',
        published: false,
        priceCents: 0,
        order: 0,
    });

    useEffect(() => {
        if (!bookId) return;
        fetchBook(bookId)
            .then((book) => {
                setForm({
                    title: book.title,
                    slug: book.slug,
                    description: book.description,
                    descriptionHtml: book.descriptionHtml || book.description || '',
                    thumbnailUrl: book.thumbnailUrl || '',
                    pdfPath: book.pdfPath || '',
                    published: book.published,
                    priceCents: book.priceCents,
                    order: book.order,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [bookId]);

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
                await updateBook(bookId, payload);
                router.visit(route('admin.books.index'));
            } else {
                const created = await createBook(payload);
                router.visit(route('admin.books.edit', created.id));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleThumbnail(file) {
        const { url } = await uploadThumbnail(file, 'marketing');
        updateField('thumbnailUrl', url);
    }

    async function handlePdf(file) {
        setUploading(true);
        setError(null);
        try {
            const data = await uploadPdf(file, 'books');
            updateField('pdfPath', data.path || '');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <AdminShell title={isEdit ? 'Edit book' : 'New book'}>
            <Head title={isEdit ? 'Edit book' : 'New book'} />
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
                                value={form.priceCents}
                                onChange={(e) => updateField('priceCents', Number(e.target.value))}
                            />
                            <p className="mt-1 text-xs text-faint">
                                Displays as {formatPrice(form.priceCents, currency)} ({currency})
                            </p>
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
                            placeholder="Book overview and what readers will get…"
                            minHeight="12rem"
                            required
                        />
                    </div>
                    <div>
                        <label className="label-dark">Thumbnail URL</label>
                        <input
                            className="input-dark"
                            value={form.thumbnailUrl}
                            onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="mt-2 text-sm"
                            onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])}
                        />
                    </div>
                    <div>
                        <label className="label-dark">Book PDF (website reading only)</label>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            className="mt-1 text-sm"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePdf(file);
                                e.target.value = '';
                            }}
                        />
                        {uploading && <p className="mt-1 text-xs text-muted">Uploading PDF…</p>}
                        {form.pdfPath ? (
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <p className="text-sm text-emerald-300">PDF uploaded (private storage)</p>
                                <button type="button" className="btn-secondary" onClick={() => updateField('pdfPath', '')}>
                                    Remove PDF
                                </button>
                            </div>
                        ) : (
                            <p className="mt-1 text-xs text-faint">
                                PDF is stored privately and only streamed to users with approved access.
                            </p>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : isEdit ? 'Save book' : 'Create book'}
                        </button>
                        <Link href={route('admin.books.index')} className="btn-secondary">
                            Cancel
                        </Link>
                    </div>
                </form>
            )}
        </AdminShell>
    );
}
