import MarketingLayout from '@/Layouts/MarketingLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Landing({ courses = [], siteName }) {
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

    return (
        <MarketingLayout>
            <Head title={siteName} />

            <section className="space-y-6 py-12 text-center">
                <h1 className="text-4xl font-bold">
                    Train smarter. Prep harder.{' '}
                    <span className="text-accentSoft">Build your best physique.</span>
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Evidence-based bodybuilding coaching, online courses, and member content.
                </p>
                <div className="flex gap-3 justify-center">
                    <a href="#apply" className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white">
                        Request access
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
                <section id="courses" className="py-12 border-t border-slate-800">
                    <h2 className="text-2xl font-bold mb-6 text-center">Available courses</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {courses.map((course) => (
                            <article key={course.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                                <h3 className="font-semibold">{course.title}</h3>
                                <p className="text-xs text-slate-400 mt-2 line-clamp-3">{course.description}</p>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <section id="apply" className="py-12 border-t border-slate-800 max-w-lg mx-auto">
                <h2 className="text-xl font-bold mb-4 text-center">Request mentorship or course access</h2>
                {recentlySuccessful && (
                    <p className="mb-4 text-sm text-emerald-400 text-center">Request submitted successfully.</p>
                )}
                <form onSubmit={submit} className="space-y-4">
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                        placeholder="Name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                    <input
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                        placeholder="Email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <textarea
                        className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
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
            </section>
        </MarketingLayout>
    );
}
