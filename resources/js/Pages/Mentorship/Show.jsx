import AppLayout from '@/Layouts/AppLayout';
import PdfDownloadLink from '@/Components/PdfDownloadLink';
import EmbeddedVideoSlot from '@/Components/EmbeddedVideoSlot';
import MentorshipVideoPlayer from '@/Components/MentorshipVideoPlayer';
import RichContent from '@/Components/RichContent';
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
                {mentorship.hasVideo && (
                    <MentorshipVideoPlayer mentorshipId={mentorship.id} title={mentorship.title} />
                )}
                {!mentorship.hasVideo && mentorship.hasEmbeddedVideo && (
                    <EmbeddedVideoSlot
                        slot={0}
                        playbackUrl={route('mentorship.embed.playback', [mentorship.id, 0])}
                        title={mentorship.title}
                    />
                )}
                <PdfDownloadLink url={mentorship.pdfUrl} label="Download PDF" />
                <RichContent
                    html={mentorship.contentHtml}
                    hiddenSlots={!mentorship.hasVideo && mentorship.hasEmbeddedVideo ? [0] : []}
                    embedPlaybackUrl={(slot) => route('mentorship.embed.playback', [mentorship.id, slot])}
                />
            </article>
        </AppLayout>
    );
}
