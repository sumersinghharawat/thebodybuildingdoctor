import AdminShell from '@/Components/Admin/AdminShell';
import LessonManager from '@/Components/Admin/LessonManager';
import PdfUploadField from '@/Components/Admin/PdfUploadField';
import RichTextEditor, { htmlToPlainText } from '@/Components/RichTextEditor';
import { createCourse, fetchCourse, updateCourse, uploadThumbnail } from '@/lib/admin-api';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CourseForm({ courseId }) {
    const isEdit = Boolean(courseId);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        description: '',
        descriptionHtml: '',
        thumbnailUrl: '',
        pdfUrl: '',
        instructorName: 'The Bodybuilding Doctor',
        level: 'beginner',
        category: 'Training',
        published: false,
        priceCents: 0,
        order: 0,
    });

    useEffect(() => {
        if (!courseId) return;
        fetchCourse(courseId)
            .then((data) => {
                setLessons(data.lessons);
                setForm({
                    title: data.course.title,
                    slug: data.course.slug,
                    description: data.course.description,
                    descriptionHtml: data.course.descriptionHtml || data.course.description || '',
                    thumbnailUrl: data.course.thumbnailUrl || '',
                    pdfUrl: data.course.pdfUrl || '',
                    instructorName: data.course.instructorName || '',
                    level: data.course.level,
                    category: data.course.category,
                    published: data.course.published,
                    priceCents: data.course.priceCents,
                    order: data.course.order,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [courseId]);

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
                await updateCourse(courseId, payload);
                router.visit(route('admin.courses.show', courseId));
            } else {
                const created = await createCourse(payload);
                router.visit(route('admin.courses.edit', created.id));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleThumbnail(file) {
        const { url } = await uploadThumbnail(file, 'courses');
        updateField('thumbnailUrl', url);
    }

    return (
        <AdminShell title={isEdit ? 'Edit course' : 'New course'}>
            <Head title={isEdit ? 'Edit course' : 'New course'} />
            {loading ? (
                <p className="text-sm text-slate-400">Loading…</p>
            ) : (
                <div className="space-y-8">
                    <form onSubmit={handleSave} className="card-surface space-y-4 p-6">
                        {error && <p className="text-sm text-red-300">{error}</p>}
                        <div>
                            <label className="label-dark">Title</label>
                            <input className="input-dark" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="label-dark">Slug</label>
                                <input className="input-dark" value={form.slug} onChange={(e) => updateField('slug', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-dark">Category</label>
                                <input className="input-dark" value={form.category} onChange={(e) => updateField('category', e.target.value)} />
                            </div>
                            <div>
                                <label className="label-dark">Level</label>
                                <select className="input-dark" value={form.level} onChange={(e) => updateField('level', e.target.value)}>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-dark">Price (cents)</label>
                                <input className="input-dark" type="number" value={form.priceCents} onChange={(e) => updateField('priceCents', Number(e.target.value))} />
                            </div>
                        </div>
                        <div>
                            <label className="label-dark">Description</label>
                            <RichTextEditor
                                value={form.descriptionHtml}
                                onChange={(value) => updateField('descriptionHtml', value)}
                                placeholder="Write the course overview, what members will learn, and key details…"
                                minHeight="14rem"
                                required
                            />
                        </div>
                        <div>
                            <label className="label-dark">Thumbnail URL</label>
                            <input className="input-dark" value={form.thumbnailUrl} onChange={(e) => updateField('thumbnailUrl', e.target.value)} />
                            <input type="file" accept="image/*" className="mt-2 text-sm" onChange={(e) => e.target.files?.[0] && handleThumbnail(e.target.files[0])} />
                        </div>
                        <PdfUploadField
                            label="Course PDF"
                            value={form.pdfUrl}
                            onChange={(value) => updateField('pdfUrl', value)}
                            folder="courses"
                        />
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.published} onChange={(e) => updateField('published', e.target.checked)} />
                            Published
                        </label>
                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : 'Save course'}
                            </button>
                            {isEdit && (
                                <Link href={route('admin.courses.show', courseId)} className="btn-secondary">
                                    Cancel
                                </Link>
                            )}
                        </div>
                    </form>

                    {isEdit && (
                        <LessonManager courseId={courseId} lessons={lessons} onLessonsChange={setLessons} />
                    )}
                </div>
            )}
        </AdminShell>
    );
}
