import AdminShell from '@/Components/Admin/AdminShell';
import { AdminListToolbar, EmptyState, StatusBadge } from '@/Components/Admin/AdminListControls';
import { deleteCourse, fetchCourses, formatDuration, formatPrice } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function CoursesIndex() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    const counts = useMemo(() => ({
        all: courses.length,
        published: courses.filter((item) => item.published).length,
        draft: courses.filter((item) => !item.published).length,
    }), [courses]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return courses
            .filter((course) => {
                if (statusFilter === 'published' && !course.published) return false;
                if (statusFilter === 'draft' && course.published) return false;
                if (!q) return true;
                return [course.title, course.published ? 'published' : 'draft']
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(q));
            })
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    }, [courses, query, statusFilter]);

    return (
        <AdminShell
            title="Courses"
            description="Create and publish course content, then manage lessons."
            actions={
                <Link href={route('admin.courses.create')} className="btn-primary">
                    New course
                </Link>
            }
        >
            <Head title="Courses" />
            {loading && <p className="text-sm text-muted">Loading courses…</p>}
            {error && (
                <div className="card-surface p-4 text-sm text-red-600 dark:text-red-300">
                    {error}
                    <button type="button" onClick={load} className="mt-2 block text-accent underline">
                        Retry
                    </button>
                </div>
            )}
            {!loading && !error && (
                <div className="space-y-5">
                    <AdminListToolbar
                        query={query}
                        onQueryChange={setQuery}
                        placeholder="Search by title…"
                        filter={statusFilter}
                        onFilterChange={setStatusFilter}
                        filterOptions={[
                            { value: 'all', label: 'All', count: counts.all },
                            { value: 'published', label: 'Published', count: counts.published },
                            { value: 'draft', label: 'Draft', count: counts.draft },
                        ]}
                        resultLabel={`${filtered.length} course${filtered.length === 1 ? '' : 's'}`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState
                            title={query.trim() || statusFilter !== 'all' ? 'No courses match' : 'No courses yet'}
                            description="Create a course, then add lessons from the course detail page."
                        />
                    ) : (
                        <div className="space-y-3">
                            {filtered.map((course) => (
                                <article
                                    key={course.id}
                                    className="card-surface flex flex-wrap items-center justify-between gap-4 p-4"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">{course.title}</h3>
                                            <StatusBadge status={course.published ? 'published' : 'draft'} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted">
                                            {course.lessonCount} lessons · {formatDuration(course.totalDurationSec)} ·{' '}
                                            {formatPrice(course.priceCents)}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('admin.courses.show', course.id)} className="btn-secondary">
                                            Lessons
                                        </Link>
                                        <Link href={route('admin.courses.edit', course.id)} className="btn-secondary">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn-secondary text-red-600 dark:text-red-300"
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
