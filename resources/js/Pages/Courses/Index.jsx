import CourseCard from '@/Components/Marketing/CourseCard';
import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link } from '@inertiajs/react';

export default function CoursesIndex({ courses = [], siteName, appSection }) {
    return (
        <MarketingLayout showAppLink={appSection?.enabled !== false}>
            <Head title={`Courses · ${siteName}`} />

            <section className="space-y-8 py-12">
                <header className="space-y-3 text-center">
                    <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">Online learning</p>
                    <h1 className="text-3xl font-bold md:text-4xl">All courses</h1>
                    <p className="mx-auto max-w-2xl text-slate-400">
                        Evidence-based programs covering performance pharmacology, prep coaching, and real athlete
                        case breakdowns.
                    </p>
                </header>

                {courses.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-sm text-slate-400">No courses published yet.</p>
                )}

                <div className="flex justify-center pt-4">
                    <Link
                        href={route('home')}
                        className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                    >
                        ← Back to home
                    </Link>
                    <Link
                        href={`${route('home')}#apply`}
                        className="ml-3 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"
                    >
                        Request access
                    </Link>
                </div>
            </section>
        </MarketingLayout>
    );
}
