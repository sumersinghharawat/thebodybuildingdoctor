import AdminShell from '@/Components/Admin/AdminShell';
import { deleteCourse, fetchCourses, formatDuration, formatPrice } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CoursesIndex() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCourses();
            setCourses(data.courses);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function handleDelete(course) {
        if (!confirm(`Delete "${course.title}" and all its lessons?`)) return;
        await deleteCourse(course.id);
        setCourses((prev) => prev.filter((item) => item.id !== course.id));
    }

    const q = query.trim().toLowerCase();
    const filtered = !q
        ? courses
        : courses.filter((course) =>
              [course.title, course.published ? 'published' : 'draft']
                  .filter(Boolean)
                  .some((value) => String(value).toLowerCase().includes(q)),
          );

    return (
        <AdminShell
            title="Courses"
            actions={
                <Link href={route('admin.courses.create')} className="btn-primary">
                    New course
                </Link>
            }
        >
            <Head title="Courses" />
            {loading && <p className="text-sm text-slate-400">Loading courses…</p>}
            {error && (
                <div className="card-surface p-4 text-sm text-red-300">
                    {error}
                    <button type="button" onClick={load} className="mt-2 block text-accent underline">
                        Retry
                    </button>
                </div>
            )}
            {!loading && !error && (
                <div className="space-y-4">
                    <input
                        type="search"
                        className="input-dark max-w-md"
                        placeholder="Search by title or status…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search courses"
                    />

                    {filtered.length === 0 ? (
                        <p className="text-sm text-slate-400">
                            {query.trim() ? 'No courses match your search.' : 'No courses yet.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((course) => (
                                <article
                                    key={course.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div>
                                        <h3 className="font-semibold">{course.title}</h3>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {course.lessonCount} lessons · {formatDuration(course.totalDurationSec)} ·{' '}
                                            {formatPrice(course.priceCents)} ·{' '}
                                            <span className={course.published ? 'text-emerald-400' : 'text-amber-400'}>
                                                {course.published ? 'Published' : 'Draft'}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('admin.courses.show', course.id)} className="btn-secondary">
                                            View
                                        </Link>
                                        <Link href={route('admin.courses.edit', course.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-300"
                                            onClick={() => handleDelete(course)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </AdminShell>
    );
}
