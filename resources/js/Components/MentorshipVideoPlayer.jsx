import ContentVideoPlayer from '@/Components/ContentVideoPlayer';
import { useEffect, useState } from 'react';

export default function MentorshipVideoPlayer({ mentorshipId, title }) {
    const [playback, setPlayback] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch(route('mentorship.playback', mentorshipId), {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Could not load video');
                }
                if (!cancelled) {
                    setPlayback(data.playback ?? null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [mentorshipId]);

    if (error) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-edge bg-surface text-sm text-muted">
                {error}
            </div>
        );
    }

    if (!playback) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-edge bg-surface text-sm text-faint">
                Loading video…
            </div>
        );
    }

    return <ContentVideoPlayer playback={playback} title={title} />;
}
