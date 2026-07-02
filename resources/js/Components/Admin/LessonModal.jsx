import Modal from '@/Components/Modal';
import PdfUploadField from '@/Components/Admin/PdfUploadField';
import { useEffect, useState } from 'react';

const emptyLesson = {
    title: '',
    videoUrl: '',
    durationSec: 0,
    freePreview: false,
    contentHtml: '',
    pdfUrl: '',
};

export default function LessonModal({ show, lesson, onClose, onSave, saving }) {
    const isEdit = Boolean(lesson?.id);
    const [form, setForm] = useState(emptyLesson);

    useEffect(() => {
        if (show) {
            setForm(
                lesson
                    ? {
                          title: lesson.title ?? '',
                          videoUrl: lesson.videoUrl ?? '',
                          durationSec: lesson.durationSec ?? 0,
                          freePreview: Boolean(lesson.freePreview),
                          contentHtml: lesson.contentHtml ?? '',
                          pdfUrl: lesson.pdfUrl ?? '',
                      }
                    : emptyLesson,
            );
        }
    }, [show, lesson]);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleSubmit(e) {
        e.preventDefault();
        onSave(form);
    }

    return (
        <Modal
            show={show}
            onClose={onClose}
            maxWidth="2xl"
            panelClassName="border border-slate-700 bg-slate-900 text-slate-100"
        >
            <form onSubmit={handleSubmit} className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">{isEdit ? 'Edit lesson' : 'New lesson'}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                            Add video URL and optional written content for this lesson.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-700 px-2 py-1 text-sm text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div>
                    <label className="label-dark">Title</label>
                    <input
                        className="input-dark"
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="label-dark">Video URL</label>
                    <input
                        className="input-dark"
                        placeholder="YouTube, Vimeo, or direct file URL"
                        value={form.videoUrl}
                        onChange={(e) => updateField('videoUrl', e.target.value)}
                    />
                </div>

                <div>
                    <label className="label-dark">Duration (seconds)</label>
                    <input
                        className="input-dark"
                        type="number"
                        min={0}
                        value={form.durationSec}
                        onChange={(e) => updateField('durationSec', Number(e.target.value))}
                    />
                </div>

                <div>
                    <label className="label-dark">Content HTML</label>
                    <textarea
                        className="input-dark font-mono text-xs"
                        rows={8}
                        value={form.contentHtml}
                        onChange={(e) => updateField('contentHtml', e.target.value)}
                        placeholder="Optional lesson notes, embeds, or rich text HTML"
                    />
                </div>

                <PdfUploadField
                    label="Lesson PDF"
                    value={form.pdfUrl}
                    onChange={(value) => updateField('pdfUrl', value)}
                    folder="courses"
                />

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={form.freePreview}
                        onChange={(e) => updateField('freePreview', e.target.checked)}
                    />
                    Free preview (visible without enrollment)
                </label>

                <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving…' : isEdit ? 'Save lesson' : 'Add lesson'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
