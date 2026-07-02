import LessonModal from '@/Components/Admin/LessonModal';
import { createLesson, deleteLesson, formatDuration, reorderLessons, updateLesson } from '@/lib/admin-api';
import { useState } from 'react';

export default function LessonManager({ courseId, lessons, onLessonsChange }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [saving, setSaving] = useState(false);
    const [reordering, setReordering] = useState(false);
    const [draggedId, setDraggedId] = useState(null);
    const [dragOverId, setDragOverId] = useState(null);
    const [error, setError] = useState(null);

    const sortedLessons = [...lessons].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    function openCreate() {
        setEditingLesson(null);
        setModalOpen(true);
    }

    function openEdit(lesson) {
        setEditingLesson(lesson);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingLesson(null);
    }

    async function handleSave(form) {
        setSaving(true);
        setError(null);
        try {
            if (editingLesson?.id) {
                const updated = await updateLesson(courseId, editingLesson.id, form);
                onLessonsChange(sortedLessons.map((item) => (item.id === updated.id ? updated : item)));
            } else {
                const created = await createLesson(courseId, {
                    ...form,
                    order: sortedLessons.length + 1,
                });
                onLessonsChange([...sortedLessons, created]);
            }
            closeModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(lesson) {
        if (!confirm(`Delete lesson "${lesson.title}"?`)) return;
        setError(null);
        try {
            await deleteLesson(courseId, lesson.id);
            onLessonsChange(sortedLessons.filter((item) => item.id !== lesson.id));
        } catch (err) {
            setError(err.message);
        }
    }

    async function persistOrder(nextLessons) {
        setReordering(true);
        setError(null);
        try {
            const result = await reorderLessons(
                courseId,
                nextLessons.map((lesson) => lesson.id),
            );
            onLessonsChange(result.lessons ?? nextLessons);
        } catch (err) {
            setError(err.message);
        } finally {
            setReordering(false);
        }
    }

    function handleDragStart(event, lessonId) {
        setDraggedId(lessonId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', lessonId);
    }

    function handleDragOver(event, lessonId) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (lessonId !== draggedId) {
            setDragOverId(lessonId);
        }
    }

    function handleDragLeave() {
        setDragOverId(null);
    }

    async function handleDrop(event, targetId) {
        event.preventDefault();
        setDragOverId(null);

        if (!draggedId || draggedId === targetId) {
            setDraggedId(null);
            return;
        }

        const fromIndex = sortedLessons.findIndex((lesson) => lesson.id === draggedId);
        const toIndex = sortedLessons.findIndex((lesson) => lesson.id === targetId);

        if (fromIndex < 0 || toIndex < 0) {
            setDraggedId(null);
            return;
        }

        const nextLessons = [...sortedLessons];
        const [moved] = nextLessons.splice(fromIndex, 1);
        nextLessons.splice(toIndex, 0, moved);

        const withOrder = nextLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
        }));

        onLessonsChange(withOrder);
        setDraggedId(null);
        await persistOrder(withOrder);
    }

    function handleDragEnd() {
        setDraggedId(null);
        setDragOverId(null);
    }

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold">Lessons</h3>
                    <p className="text-sm text-slate-400">Drag to reorder. Click a lesson to edit.</p>
                </div>
                <button type="button" className="btn-primary" onClick={openCreate}>
                    Add lesson
                </button>
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {reordering && <p className="text-sm text-slate-400">Saving lesson order…</p>}

            <div className="space-y-2">
                {sortedLessons.map((lesson, index) => {
                    const isDragging = draggedId === lesson.id;
                    const isDragOver = dragOverId === lesson.id;

                    return (
                        <div
                            key={lesson.id}
                            draggable
                            onDragStart={(event) => handleDragStart(event, lesson.id)}
                            onDragOver={(event) => handleDragOver(event, lesson.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(event) => handleDrop(event, lesson.id)}
                            onDragEnd={handleDragEnd}
                            className={`card-surface flex items-center gap-3 p-4 transition ${
                                isDragging ? 'opacity-50' : ''
                            } ${isDragOver ? 'border-accent ring-1 ring-accent/40' : ''}`}
                        >
                            <button
                                type="button"
                                className="cursor-grab touch-none rounded-lg border border-slate-700 px-2 py-3 text-slate-400 hover:text-white active:cursor-grabbing"
                                aria-label="Drag to reorder"
                                onMouseDown={(event) => event.stopPropagation()}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M7 4a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2zM7 11a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2zM7 18a1 1 0 110-2 1 1 0 010 2zm6-1a1 1 0 100 2 1 1 0 000-2z" />
                                </svg>
                            </button>

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold">
                                {index + 1}
                            </div>

                            <button
                                type="button"
                                onClick={() => openEdit(lesson)}
                                className="min-w-0 flex-1 text-left"
                            >
                                <p className="truncate font-medium">{lesson.title}</p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    {formatDuration(lesson.durationSec ?? 0)}
                                    {lesson.freePreview ? ' · Preview' : ''}
                                    {lesson.videoUrl ? ' · Video' : ''}
                                </p>
                            </button>

                            <button
                                type="button"
                                className="btn-secondary shrink-0 text-red-300"
                                onClick={() => handleDelete(lesson)}
                            >
                                Delete
                            </button>
                        </div>
                    );
                })}

                {sortedLessons.length === 0 && (
                    <p className="text-sm text-slate-400">No lessons yet. Add your first lesson.</p>
                )}
            </div>

            <LessonModal
                show={modalOpen}
                lesson={editingLesson}
                onClose={closeModal}
                onSave={handleSave}
                saving={saving}
            />
        </section>
    );
}
