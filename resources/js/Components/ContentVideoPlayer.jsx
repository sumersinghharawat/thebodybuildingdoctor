import YouTubeProtectedPlayer from '@/Components/YouTubeProtectedPlayer';
import VideoFullscreenButton from '@/Components/VideoFullscreenButton';
import { useFullscreen } from '@/lib/use-fullscreen';
import { resolveVideoPlayback } from '@/lib/video-playback';
import { useCallback, useState } from 'react';

function blockMediaInteraction(event) {
    event.preventDefault();
    event.stopPropagation();
}

function ProtectedVideoFrame({ children, className = '', controls = null, showFullscreen = true }) {
    const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

    return (
        <div
            ref={containerRef}
            className={`protected-video relative select-none ${isFullscreen ? 'is-fullscreen' : ''} ${className}`}
            onContextMenu={blockMediaInteraction}
            onCopy={blockMediaInteraction}
            onCut={blockMediaInteraction}
            onDragStart={blockMediaInteraction}
            onAuxClick={blockMediaInteraction}
        >
            {children}
            {controls}
            {showFullscreen && (
                <div className="protected-video__fullscreen">
                    <VideoFullscreenButton
                        isFullscreen={isFullscreen}
                        onClick={toggleFullscreen}
                        className="protected-video__fullscreen-btn"
                    />
                </div>
            )}
        </div>
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
            controls={
                !started ? (
                    <button
                        type="button"
                        className="protected-video__shield"
                        aria-label="Play video"
                        onClick={handleShieldClick}
                        onContextMenu={blockMediaInteraction}
                    >
                        <span className="protected-video__play-hint" aria-hidden="true">
                            <svg viewBox="0 0 24 24" className="h-14 w-14 fill-white">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </span>
                    </button>
                ) : null
            }
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
        return (
            <YouTubeProtectedPlayer
                videoId={resolved.videoId}
                title={title}
                className={`aspect-video overflow-hidden rounded-xl border border-slate-800 bg-black ${className}`}
            />
        );
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
