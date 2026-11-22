import ContentVideoPlayer from '@/Components/ContentVideoPlayer';
import YouTubeProtectedPlayer from '@/Components/YouTubeProtectedPlayer';
import { resolveVideoPlayback } from '@/lib/video-playback';
import { useEffect, useRef, useState } from 'react';

let vimeoApiPromise = null;

function loadVimeoPlayerApi() {
    if (typeof window === 'undefined') {
        return Promise.resolve(null);
    }

    if (window.Vimeo?.Player) {
        return Promise.resolve(window.Vimeo);
    }

    if (vimeoApiPromise) {
        return vimeoApiPromise;
    }

    vimeoApiPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        script.onload = () => resolve(window.Vimeo);
        script.onerror = () => reject(new Error('Could not load the Vimeo player'));
        document.head.appendChild(script);
    });

    return vimeoApiPromise;
}

function blockMediaInteraction(event) {
    event.preventDefault();
    event.stopPropagation();
}

function FilePreview({ src, title, maxSeconds, onPreviewLimit, autoPlay = false }) {
    const videoRef = useRef(null);
    const lockedRef = useRef(false);

    useEffect(() => {
        if (autoPlay) {
            videoRef.current?.play?.().catch(() => {});
        }
    }, [autoPlay]);

    function clampPlayback() {
        const video = videoRef.current;
        if (!video || maxSeconds == null) {
            return;
        }

        if (video.currentTime >= maxSeconds) {
            video.pause();
            video.currentTime = maxSeconds;
            if (!lockedRef.current) {
                lockedRef.current = true;
                onPreviewLimit?.();
            }
            return;
        }

        lockedRef.current = false;
    }

    return (
        <video
            ref={videoRef}
            className="h-full w-full"
            controls
            autoPlay={autoPlay}
            preload={autoPlay ? 'metadata' : 'none'}
            playsInline
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onContextMenu={blockMediaInteraction}
            onTimeUpdate={clampPlayback}
            onSeeking={clampPlayback}
            src={src}
            title={title}
        />
    );
}

function VimeoPreview({ vimeoId, title, maxSeconds, onPreviewLimit, autoPlay = false }) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const lockedRef = useRef(false);
    const onLimitRef = useRef(onPreviewLimit);
    const [started, setStarted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        onLimitRef.current = onPreviewLimit;
    }, [onPreviewLimit]);

    useEffect(() => {
        let cancelled = false;
        lockedRef.current = false;

        loadVimeoPlayerApi()
            .then((Vimeo) => {
                if (cancelled || !Vimeo || !iframeRef.current) {
                    return;
                }

                const player = new Vimeo.Player(iframeRef.current);
                playerRef.current = player;
                if (autoPlay) {
                    player.play().catch(() => {});
                }
                player.on('timeupdate', (data) => {
                    if (data.seconds < maxSeconds) {
                        lockedRef.current = false;
                        return;
                    }

                    player.pause().catch(() => {});
                    player.setCurrentTime(maxSeconds).catch(() => {});
                    if (!lockedRef.current) {
                        lockedRef.current = true;
                        onLimitRef.current?.();
                    }
                });
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message);
                }
            });

        return () => {
            cancelled = true;
            playerRef.current?.unload?.().catch(() => {});
            playerRef.current = null;
        };
    }, [autoPlay, vimeoId, maxSeconds]);

    function play() {
        setStarted(true);
        playerRef.current?.play?.().catch(() => {});
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted">{error}</div>
        );
    }

    return (
        <>
            <iframe
                ref={iframeRef}
                title={title}
                className="pointer-events-none h-full w-full"
                src={`https://player.vimeo.com/video/${vimeoId}?title=0&byline=0&portrait=0&dnt=1&controls=0`}
                allow="autoplay; encrypted-media"
                sandbox="allow-scripts allow-same-origin allow-presentation"
                referrerPolicy="strict-origin-when-cross-origin"
                tabIndex={-1}
            />
            <button
                type="button"
                className="absolute inset-0 z-[1]"
                aria-label={started ? 'Pause preview' : 'Play preview'}
                onClick={() => {
                    if (!started) {
                        play();
                        return;
                    }
                    playerRef.current?.getPaused?.().then((paused) => {
                        if (paused) {
                            play();
                        } else {
                            playerRef.current?.pause?.();
                        }
                    });
                }}
                onContextMenu={blockMediaInteraction}
            />
            {!started && (
                <span className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center" aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="h-14 w-14 fill-white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </span>
            )}
        </>
    );
}

function VideoPoster({ thumbnailUrl, title, onPlay }) {
    return (
        <button
            type="button"
            className="relative block aspect-video w-full overflow-hidden rounded-xl border border-edge bg-black"
            onClick={onPlay}
            aria-label={`Play ${title}`}
        >
            {thumbnailUrl ? (
                <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg viewBox="0 0 24 24" className="h-16 w-16 fill-white" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                </svg>
            </span>
        </button>
    );
}

export default function VaultVideoPlayer({
    videoUrl,
    title,
    thumbnailUrl = '',
    previewSeconds = null,
    onPreviewLimit,
}) {
    const [started, setStarted] = useState(false);
    const playback = resolveVideoPlayback(videoUrl);

    if (!playback) {
        return (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-edge bg-surface text-sm text-muted">
                This video is not available yet.
            </div>
        );
    }

    if (!started) {
        return <VideoPoster thumbnailUrl={thumbnailUrl} title={title} onPlay={() => setStarted(true)} />;
    }

    if (previewSeconds == null) {
        return <ContentVideoPlayer videoUrl={videoUrl} title={title} autoPlay />;
    }

    if (playback.provider === 'youtube') {
        return (
            <YouTubeProtectedPlayer
                videoId={playback.videoId}
                title={title}
                maxSeconds={previewSeconds}
                onPreviewLimit={onPreviewLimit}
                autoPlay
                className="aspect-video overflow-hidden rounded-xl border border-edge bg-black"
            />
        );
    }

    return (
        <div
            className="relative aspect-video overflow-hidden rounded-xl border border-edge bg-black"
            onContextMenu={blockMediaInteraction}
        >
            {playback.provider === 'vimeo' ? (
                <VimeoPreview
                    vimeoId={playback.vimeoId}
                    title={title}
                    maxSeconds={previewSeconds}
                    onPreviewLimit={onPreviewLimit}
                    autoPlay
                />
            ) : (
                <FilePreview
                    src={playback.playbackUrl}
                    title={title}
                    maxSeconds={previewSeconds}
                    onPreviewLimit={onPreviewLimit}
                    autoPlay
                />
            )}
        </div>
    );
}
