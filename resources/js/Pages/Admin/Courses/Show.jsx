import AdminShell from '@/Components/Admin/AdminShell';
import { fetchCourse, formatDuration } from '@/lib/admin-api';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CourseShow({ courseId }) {
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourse(courseId)
            .then((data) => {
                setCourse(data.course);
                setLessons(data.lessons);
            })
            .catch((err) => setError(err.message));
    }, [courseId]);

    return (
        <AdminShell
            title={course?.title || 'Course'}
            actions={
                <Link href={route('admin.courses.edit', courseId)} className="btn-primary">
                    Edit course
                </Link>
            }
        >
            <Head title={course?.title || 'Course'} />
            {error && <p className="text-sm text-red-300">{error}</p>}
            {course && (
                <div className="space-y-6">
                    <div className="card-surface p-6">
                        <p className="text-sm text-slate-400">{course.description}</p>
                        <p className="mt-3 text-xs text-slate-500">
                            {course.lessonCount} lessons · {formatDuration(course.totalDurationSec)} ·{' '}
                            {course.published ? 'Published' : 'Draft'}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-semibold">Lessons</h3>
                        {lessons.map((lesson, index) => (
                            <div key={lesson.id} className="card-surface flex items-center justify-between p-4">
                                <div>
                                    <p className="font-medium">
                                        {index + 1}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {formatDuration(lesson.durationSec)}
                                        {lesson.freePreview ? ' · Preview' : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AdminShell>
    );
}
