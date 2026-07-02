import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function LearnIndex({ enrolledCourses = [], browseCourses = [] }) {
    return (
        <AppLayout>
            <Head title="My Courses" />
            <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10">
                <header>
                    <h1 className="text-2xl font-bold">My courses</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Enrollment is managed by an administrator.
                    </p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold">Continue learning</h2>
                    {enrolledCourses.length === 0 ? (
                        <p className="text-slate-400 text-sm">No enrollments yet.</p>
                    ) : (
                        <CourseGrid courses={enrolledCourses} />
                    )}
                </section>

                {browseCourses.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Browse courses</h2>
                        <CourseGrid courses={browseCourses} />
                    </section>
                )}
            </div>
        </AppLayout>
    );
}

function CourseGrid({ courses }) {
    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    href={route('learn.courses.show', course.id)}
                    className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-600 transition"
                >
                    {course.thumbnailUrl && (
                        <img src={course.thumbnailUrl} alt="" className="w-full aspect-video object-cover" />
                    )}
                    <div className="p-4">
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{course.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
