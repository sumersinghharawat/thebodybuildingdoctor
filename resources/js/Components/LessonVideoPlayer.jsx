import { useEffect, useState } from 'react';

export default function LessonVideoPlayer({ courseId, lessonId, title }) {
    const [playback, setPlayback] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            try {
                const res = await fetch(
                    `/api/learn/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/playback`,
                    { credentials: 'include' },
                );
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Could not load video');
                if (!cancelled) setPlayback(data.playback);
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [courseId, lessonId]);

    if (error) {
        return (
            <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-sm text-slate-400">
                {error}
            </div>
        );
    }

    if (!playback) {
        return (
            <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-sm text-slate-500">
                Loading video…
            </div>
        );
    }

    if (playback.provider === 'youtube') {
        return (
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                <iframe
                    title={title}
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${playback.videoId}?controls=0&modestbranding=1&rel=0&fs=0`}
                    allow="autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>
        );
    }

    if (playback.provider === 'vimeo') {
        return (
            <div className="aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black">
                <iframe
                    title={title}
                    className="h-full w-full"
                    src={`https://player.vimeo.com/video/${playback.vimeoId}?title=0&byline=0&portrait=0`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>
        );
    }

    if (playback.provider === 'file') {
        return (
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                <video className="h-full w-full" controls controlsList="nodownload" src={playback.playbackUrl} title={title} />
            </div>
        );
    }

    return (
        <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-sm text-slate-400">
            Unsupported video provider
        </div>
    );
}
