import CourseCard from '@/Components/Marketing/CourseCard';
import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

const MENTORSHIP_BENEFITS = [
    {
        title: 'Real case lab breakdowns',
        description: 'Walk through actual athlete scenarios — bloodwork, compounds, recovery, and decision-making.',
    },
    {
        title: 'Whiteboard coaching sessions',
        description: 'Structured lectures on prep, hormones, peptides, peak week, and performance physiology.',
    },
    {
        title: 'Direct coaching perspective',
        description: 'Learn how experienced coaches evaluate risk, responsiveness, and long-term athlete health.',
    },
    {
        title: 'Member-only video library',
        description: 'Access mentorship lectures, case studies, and training updates as they are published.',
    },
    {
        title: 'Practical protocol frameworks',
        description: 'Move beyond bro-science with systems you can apply to your own prep or coaching practice.',
    },
    {
        title: 'Ongoing education',
        description: 'New mentorship content added regularly so you stay current with real-world coaching.',
    },
];

export default function Landing({ courses = [], totalCourseCount = 0, siteName, appSection }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        type: 'both',
        courseId: '',
        courseTitle: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('inquiries.store'));
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const courseId = params.get('courseId') || '';
        const courseTitle = params.get('courseTitle') || '';

        if (!courseId && !courseTitle) {
            return;
        }

        setData((current) => ({
            ...current,
            type: 'courses',
            courseId,
            courseTitle,
            message: courseTitle
                ? `I would like access to the course "${courseTitle}".`
                : 'I would like access to a course.',
        }));
    }, [setData]);

    const showViewMore = totalCourseCount > courses.length;

    return (
        <MarketingLayout showAppLink={appSection?.enabled !== false}>
            <Head title={siteName} />

            <section className="space-y-6 py-12 text-center md:py-16">
                <h1 className="text-4xl font-bold md:text-5xl">
                    Train smarter. Prep harder.{' '}
                    <span className="text-accentSoft">Build your best physique.</span>
                </h1>
                <p className="mx-auto max-w-2xl text-slate-400">
                    Evidence-based bodybuilding coaching, online courses, mentorship, and a dedicated mobile app.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <a href="#apply" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white">
                        Request access
                    </a>
                    <a
                        href="#courses"
                        className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200"
                    >
                        Browse courses
                    </a>
                    <Link
                        href={route('login')}
                        className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200"
                    >
                        Member login
                    </Link>
                </div>
            </section>

            {courses.length > 0 && (
                <section id="courses" className="border-t border-slate-800 py-12 md:py-16">
                    <div className="mb-8 space-y-2 text-center">
                        <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">Courses</p>
                        <h2 className="text-2xl font-bold md:text-3xl">Available courses</h2>
                        <p className="mx-auto max-w-2xl text-sm text-slate-400">
                            Structured programs with recorded lectures, case studies, and practical frameworks.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                    {showViewMore && (
                        <div className="mt-8 text-center">
                            <Link
                                href={route('courses.index')}
                                className="inline-flex rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                            >
                                View all {totalCourseCount} courses
                            </Link>
                        </div>
                    )}
                </section>
            )}

            <section id="mentorship" className="border-t border-slate-800 py-12 md:py-16">
                <div className="mb-8 space-y-2 text-center">
                    <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">Mentorship</p>
                    <h2 className="text-2xl font-bold md:text-3xl">What you get with mentorship</h2>
                    <p className="mx-auto max-w-2xl text-sm text-slate-400">
                        Mentorship is for athletes and coaches who want deeper, real-world education — not surface-level
                        tips.
                    </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {MENTORSHIP_BENEFITS.map((benefit) => (
                        <article
                            key={benefit.title}
                            className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
                        >
                            <h3 className="font-semibold text-slate-100">{benefit.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-400">{benefit.description}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-8 text-center">
                    <a
                        href="#apply"
                        className="inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white"
                    >
                        Apply for mentorship
                    </a>
                </div>
            </section>

            {appSection?.enabled !== false && (
            <section id="app" className="border-t border-slate-800 py-12 md:py-16">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    <div className="space-y-4">
                        <p className="text-sm font-medium uppercase tracking-widest text-accentSoft">{appSection.eyebrow}</p>
                        <h2 className="text-2xl font-bold md:text-3xl">{appSection.title}</h2>
                        <p className="text-slate-400">{appSection.description}</p>
                        <ul className="space-y-2 text-sm text-slate-300">
                            {appSection.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <span className="mt-1 text-accentSoft">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        {appSection.downloadUrl ? (
                            <a
                                href={appSection.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                {...(!appSection.playStoreUrl ? { download: true } : {})}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                <AndroidIcon />
                                {appSection.buttonLabel}
                            </a>
                        ) : (
                            <p className="inline-flex items-center rounded-full border border-slate-700 px-5 py-2.5 text-sm text-slate-400">
                                {appSection.comingSoonLabel}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-xs rounded-[2rem] border border-slate-700 bg-slate-900 p-3 shadow-2xl shadow-black/40">
                            <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-950">
                                {appSection.screenshotUrl ? (
                                    <img
                                        src={appSection.screenshotUrl}
                                        alt={appSection.title}
                                        className="aspect-[9/16] w-full object-cover"
                                    />
                                ) : (
                                    <div className="p-6">
                                        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-700" />
                                        <div className="space-y-3">
                                            <div className="h-3 w-2/3 rounded bg-slate-800" />
                                            <div className="h-24 rounded-lg bg-gradient-to-br from-accent/30 to-slate-800" />
                                            <div className="h-2 w-full rounded bg-slate-800" />
                                            <div className="h-2 w-5/6 rounded bg-slate-800" />
                                            <div className="h-2 w-4/6 rounded bg-slate-800" />
                                        </div>
                                        {appSection.mockupLabel && (
                                            <p className="mt-6 text-center text-xs font-medium text-slate-500">
                                                {appSection.mockupLabel}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            )}

            <section id="apply" className="border-t border-slate-800 py-12 md:py-16">
                <div className="mx-auto max-w-lg">
                    <h2 className="mb-2 text-center text-xl font-bold">Request mentorship or course access</h2>
                    <p className="mb-6 text-center text-sm text-slate-400">
                        Tell us what you are looking for and we will get back to you.
                    </p>
                    {recentlySuccessful && (
                        <p className="mb-4 text-center text-sm text-emerald-400">Request submitted successfully.</p>
                    )}
                    <form onSubmit={submit} className="space-y-4">
                        <input
                            className="input-dark w-full"
                            placeholder="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                        <input
                            className="input-dark w-full"
                            placeholder="Email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                        <input
                            className="input-dark w-full"
                            placeholder="Phone (optional)"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <textarea
                            className="input-dark w-full"
                            placeholder="Message"
                            rows={4}
                            value={data.message}
                            onChange={(e) => setData('message', e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-full bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Submit request
                        </button>
                    </form>
                </div>
            </section>
        </MarketingLayout>
    );
}

function AndroidIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M17.6 9.48l1.84-3.18c.16-.28.06-.62-.22-.78a.6.6 0 0 0-.78.22l-1.87 3.23a11.4 11.4 0 0 0-8.6 0L6.1 5.74a.6.6 0 0 0-.78-.22c-.28.16-.38.5-.22.78L7.4 9.48A10.2 10.2 0 0 0 4 14.5h16a10.2 10.2 0 0 0-3.4-5.02zM8.5 16.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
        </svg>
    );
}
