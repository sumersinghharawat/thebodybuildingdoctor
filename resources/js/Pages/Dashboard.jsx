import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ mentorship = [], isAdmin }) {
    return (
        <AppLayout>
            <Head title="Mentorship" />
            <div className="mx-auto max-w-6xl space-y-6 p-6 md:p-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Mentorship</h1>
                        <p className="mt-1 text-sm text-slate-400">Member mentorship lectures, case labs, and coaching content.</p>
                    </div>
                    {isAdmin && (
                        <Link href={route('admin.mentorship.create')} className="btn-primary">
                            New content
                        </Link>
                    )}
                </header>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mentorship.map((item) => (
                        <Link
                            key={item.id}
                            href={route('mentorship.show', item.slug)}
                            className="card-surface overflow-hidden transition hover:border-slate-600"
                        >
                            {item.thumbnailUrl && (
                                <img src={item.thumbnailUrl} alt="" className="aspect-video w-full object-cover" />
                            )}
                            <div className="p-4">
                                <h2 className="font-semibold">{item.title}</h2>
                                <p className="mt-2 line-clamp-3 text-xs text-slate-400">{item.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {mentorship.length === 0 && <p className="text-sm text-slate-400">No mentorship content published yet.</p>}
            </div>
        </AppLayout>
    );
}
