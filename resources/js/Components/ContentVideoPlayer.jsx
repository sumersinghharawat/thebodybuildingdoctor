import { resolveVideoPlayback } from '@/lib/video-playback';
import { useCallback, useRef, useState } from 'react';

function blockMediaInteraction(event) {
    event.preventDefault();
    event.stopPropagation();
}

function ProtectedVideoFrame({ children, className = '', onShieldClick, showPlayHint = false }) {
    return (
        <div
            className={`protected-video relative select-none ${className}`}
            onContextMenu={blockMediaInteraction}
            onCopy={blockMediaInteraction}
            onCut={blockMediaInteraction}
            onDragStart={blockMediaInteraction}
            onAuxClick={blockMediaInteraction}
        >
            {children}
            <button
                type="button"
                className="protected-video__shield"
                aria-label={showPlayHint ? 'Play video' : 'Video player'}
                onClick={onShieldClick}
                onContextMenu={blockMediaInteraction}
            >
                {showPlayHint && (
                    <span className="protected-video__play-hint" aria-hidden="true">
                        <svg viewBox="0 0 24 24" className="h-14 w-14 fill-white">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </span>
                )}
            </button>
        </div>
    );
}

function sendYouTubeCommand(iframe, command) {
    iframe?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*',
    );
}

function YouTubeEmbed({ videoId, title, className }) {
    const iframeRef = useRef(null);
    const [started, setStarted] = useState(false);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const embedSrc =
        `https://www.youtube-nocookie.com/embed/${videoId}` +
        `?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&iv_load_policy=3` +
        `&enablejsapi=1&playsinline=1&origin=${encodeURIComponent(origin)}`;

    const handleShieldClick = useCallback(() => {
        if (!iframeRef.current) {
            return;
        }

        if (!started) {
            sendYouTubeCommand(iframeRef.current, 'playVideo');
            setStarted(true);
            return;
        }

        sendYouTubeCommand(iframeRef.current, 'pauseVideo');
        setStarted(false);
    }, [started]);

    return (
        <ProtectedVideoFrame
            className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}
            onShieldClick={handleShieldClick}
            showPlayHint={!started}
        >
            <iframe
                ref={iframeRef}
                title={title}
                className="h-full w-full pointer-events-none"
                src={embedSrc}
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                tabIndex={-1}
            />
        </ProtectedVideoFrame>
    );
}

function VimeoEmbed({ vimeoId, title, className }) {
    const [started, setStarted] = useState(false);
    const embedSrc =
        `https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&dnt=1` +
        (started ? '&autoplay=1' : '');

    const handleShieldClick = useCallback(() => {
        setStarted(true);
    }, []);

    return (
        <ProtectedVideoFrame
            className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}
            onShieldClick={handleShieldClick}
            showPlayHint={!started}
        >
            <iframe
                key={embedSrc}
                title={title}
                className="h-full w-full pointer-events-none"
                src={embedSrc}
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                tabIndex={-1}
            />
        </ProtectedVideoFrame>
    );
}

export default function ContentVideoPlayer({ videoUrl, playback, title, className = '' }) {
    const resolved = playback ?? resolveVideoPlayback(videoUrl);

    if (!resolved) {
        return null;
    }

    if (resolved.provider === 'youtube') {
        return <YouTubeEmbed videoId={resolved.videoId} title={title} className={className} />;
    }

    if (resolved.provider === 'vimeo') {
        return <VimeoEmbed vimeoId={resolved.vimeoId} title={title} className={className} />;
    }

    if (resolved.provider === 'file') {
        return (
            <ProtectedVideoFrame className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}>
                <video
                    className="h-full w-full"
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={blockMediaInteraction}
                    src={resolved.playbackUrl}
                    title={title}
                />
            </ProtectedVideoFrame>
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
