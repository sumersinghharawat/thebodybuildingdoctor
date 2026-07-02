import { resolveVideoPlayback } from '@/lib/video-playback';

export default function ContentVideoPlayer({ videoUrl, playback, title, className = '' }) {
    const resolved = playback ?? resolveVideoPlayback(videoUrl);

    if (!resolved) {
        return null;
    }

    if (resolved.provider === 'youtube') {
        return (
            <div className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}>
                <iframe
                    title={title}
                    className="h-full w-full"
                    src={`https://www.youtube-nocookie.com/embed/${resolved.videoId}?controls=0&modestbranding=1&rel=0&fs=0`}
                    allow="autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>
        );
    }

    if (resolved.provider === 'vimeo') {
        return (
            <div className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}>
                <iframe
                    title={title}
                    className="h-full w-full"
                    src={`https://player.vimeo.com/video/${resolved.vimeoId}?title=0&byline=0&portrait=0`}
                    allow="autoplay; fullscreen; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                />
            </div>
        );
    }

    if (resolved.provider === 'file') {
        return (
            <div className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}>
                <video
                    className="h-full w-full"
                    controls
                    controlsList="nodownload"
                    src={resolved.playbackUrl}
                    title={title}
                />
            </div>
        );
    }

    return (
        <div
            className={`flex aspect-video items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm text-slate-400 ${className}`}
        >
            Unsupported video provider
        </div>
    );
}
