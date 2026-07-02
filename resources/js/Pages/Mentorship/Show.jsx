import AppLayout from '@/Layouts/AppLayout';
import PdfDownloadLink from '@/Components/PdfDownloadLink';
import { Head, Link } from '@inertiajs/react';

export default function MentorshipShow({ mentorship }) {
    return (
        <AppLayout>
            <Head title={mentorship.title} />
            <article className="mx-auto max-w-3xl space-y-6 overflow-hidden p-6 md:p-8">
                <Link href={route('dashboard')} className="text-sm text-slate-400 hover:text-white">
                    ← Back to mentorship
                </Link>
                {mentorship.thumbnailUrl && (
                    <img src={mentorship.thumbnailUrl} alt="" className="aspect-video w-full rounded-xl object-cover" />
                )}
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold">{mentorship.title}</h1>
                    <p className="text-sm text-slate-400">
                        {mentorship.authorName}
                        {mentorship.publishedAt ? ` · ${new Date(mentorship.publishedAt).toLocaleDateString()}` : ''}
                    </p>
                </header>
                <PdfDownloadLink url={mentorship.pdfUrl} label="Download PDF" />
                <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: mentorship.contentHtml }}
                />
            </article>
        </AppLayout>
    );
}
