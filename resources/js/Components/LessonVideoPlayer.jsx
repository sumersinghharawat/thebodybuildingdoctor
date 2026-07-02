import ContentVideoPlayer from '@/Components/ContentVideoPlayer';
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
            <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-400">
                {error}
            </div>
        );
    }

    if (!playback) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-500">
                Loading video…
            </div>
        );
    }

    return <ContentVideoPlayer playback={playback} title={title} />;
}
