import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function BlogShow({ blog }) {
    return (
        <AppLayout>
            <Head title={blog.title} />
            <article className="mx-auto max-w-3xl space-y-6 overflow-hidden p-6 md:p-8">
                <Link href={route('dashboard')} className="text-sm text-slate-400 hover:text-white">
                    ← Back to mentorship
                </Link>
                {blog.thumbnailUrl && (
                    <img src={blog.thumbnailUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
                )}
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold">{blog.title}</h1>
                    <p className="text-sm text-slate-400">
                        {blog.authorName}
                        {blog.publishedAt ? ` · ${new Date(blog.publishedAt).toLocaleDateString()}` : ''}
                    </p>
                </header>
                <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
                />
            </article>
        </AppLayout>
    );
}
