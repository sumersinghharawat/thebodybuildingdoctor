import {
    formatPlaybackTime,
    loadYouTubePlayerApi,
    YOUTUBE_SEEK_STEP_SEC,
} from '@/lib/youtube-player-api';
import { useFullscreen } from '@/lib/use-fullscreen';
import VideoFullscreenButton from '@/Components/VideoFullscreenButton';
import { useCallback, useEffect, useRef, useState } from 'react';

function blockMediaInteraction(event) {
    event.preventDefault();
    event.stopPropagation();
}

function SkipIcon({ direction }) {
    return (
        <span className="stream-player__skip-label" aria-hidden="true">
            {direction === 'back' ? `-${YOUTUBE_SEEK_STEP_SEC}s` : `+${YOUTUBE_SEEK_STEP_SEC}s`}
        </span>
    );
}

export default function YouTubeProtectedPlayer({
    videoId,
    title,
    className = '',
    maxSeconds = null,
    onPreviewLimit = null,
    autoPlay = false,
}) {
    const mountRef = useRef(null);
    const playerRef = useRef(null);
    const hideControlsTimer = useRef(null);
    const progressTimer = useRef(null);
    const playingRef = useRef(false);
    const maxSecondsRef = useRef(maxSeconds);
    const onPreviewLimitRef = useRef(onPreviewLimit);
    const autoPlayRef = useRef(autoPlay);
    const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

    const [ready, setReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const syncProgress = useCallback(() => {
        const player = playerRef.current;
        if (!player?.getCurrentTime || !player?.getDuration) {
            return;
        }

        let nextTime = player.getCurrentTime() || 0;
        const nextDuration = player.getDuration() || 0;
        const limit = maxSecondsRef.current;

        if (limit != null && nextTime >= limit - 0.05) {
            player.pauseVideo?.();
            if (nextTime > limit) {
                player.seekTo?.(limit, true);
            }
            nextTime = limit;
            playingRef.current = false;
            setPlaying(false);
            onPreviewLimitRef.current?.();
        }

        setCurrentTime(nextTime);
        setDuration(nextDuration);
    }, []);

    const revealControls = useCallback((autoHide = true) => {
        setControlsVisible(true);
        window.clearTimeout(hideControlsTimer.current);

        if (autoHide && playingRef.current) {
            hideControlsTimer.current = window.setTimeout(() => {
                setControlsVisible(false);
            }, 2800);
        }
    }, []);

    const playVideo = useCallback(() => {
        const limit = maxSecondsRef.current;
        const current = playerRef.current?.getCurrentTime?.() ?? 0;
        if (limit != null && current >= limit - 0.05) {
            onPreviewLimitRef.current?.();
            return;
        }

        playerRef.current?.playVideo?.();
        revealControls(true);
    }, [revealControls]);

    const pauseVideo = useCallback(() => {
        playerRef.current?.pauseVideo?.();
        setControlsVisible(true);
        window.clearTimeout(hideControlsTimer.current);
    }, []);

    const togglePlay = useCallback(() => {
        const player = playerRef.current;
        if (!player?.getPlayerState) {
            return;
        }

        if (player.getPlayerState() === window.YT?.PlayerState?.PLAYING) {
            pauseVideo();
            return;
        }

        playVideo();
    }, [pauseVideo, playVideo]);

    const seekBy = useCallback(
        (delta, event) => {
            event?.stopPropagation();
            event?.preventDefault();

            const player = playerRef.current;
            if (!player?.seekTo) {
                return;
            }

            const limit = maxSecondsRef.current;
            const current = player.getCurrentTime?.() ?? currentTime;
            const total = player.getDuration?.() ?? duration;
            const cap = limit == null ? total || Number.MAX_SAFE_INTEGER : Math.min(limit, total || limit);
            const next = Math.max(0, Math.min(cap, current + delta));

            player.seekTo(next, true);
            setCurrentTime(next);
            revealControls(true);

            if (player.getPlayerState?.() !== window.YT?.PlayerState?.PLAYING) {
                player.playVideo?.();
            }

            window.setTimeout(syncProgress, 150);
        },
        [currentTime, duration, revealControls, syncProgress],
    );

    const seekTo = useCallback(
        (value, event) => {
            event?.stopPropagation();

            const player = playerRef.current;
            if (!player?.seekTo) {
                return;
            }

            const limit = maxSecondsRef.current;
            const total = player.getDuration?.() ?? duration;
            const cap = limit == null ? total || Number.MAX_SAFE_INTEGER : Math.min(limit, total || limit);
            const next = Math.max(0, Math.min(cap, Number(value)));
            player.seekTo(next, true);
            setCurrentTime(next);
            revealControls(true);
            window.setTimeout(syncProgress, 150);
        },
        [duration, revealControls, syncProgress],
    );

    useEffect(() => {
        playingRef.current = playing;
    }, [playing]);

    const syncProgressRef = useRef(syncProgress);
    const revealControlsRef = useRef(revealControls);

    useEffect(() => {
        syncProgressRef.current = syncProgress;
        revealControlsRef.current = revealControls;
        maxSecondsRef.current = maxSeconds;
        onPreviewLimitRef.current = onPreviewLimit;
        autoPlayRef.current = autoPlay;
    });

    useEffect(() => {
        let cancelled = false;

        setReady(false);
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setControlsVisible(true);

        loadYouTubePlayerApi().then((YT) => {
            if (cancelled || !YT || !mountRef.current) {
                return;
            }

            const player = new YT.Player(mountRef.current, {
                host: 'https://www.youtube-nocookie.com',
                videoId,
                playerVars: {
                    autoplay: autoPlay ? 1 : 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    fs: 0,
                    disablekb: 1,
                    iv_load_policy: 3,
                    playsinline: 1,
                    enablejsapi: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event) => {
                        if (cancelled) {
                            return;
                        }

                        playerRef.current = event.target;
                        setReady(true);
                        syncProgressRef.current();
                        if (autoPlayRef.current) {
                            event.target.playVideo?.();
                        }
                    },
                    onStateChange: (event) => {
                        if (cancelled) {
                            return;
                        }

                        const isPlaying = event.data === YT.PlayerState.PLAYING;
                        playingRef.current = isPlaying;
                        setPlaying(isPlaying);
                        setControlsVisible(true);
                        syncProgressRef.current();

                        if (isPlaying) {
                            revealControlsRef.current(true);
                        } else {
                            window.clearTimeout(hideControlsTimer.current);
                        }
                    },
                },
            });

            playerRef.current = player;
        });

        return () => {
            cancelled = true;
            window.clearTimeout(hideControlsTimer.current);
            window.clearInterval(progressTimer.current);
            playerRef.current?.destroy?.();
            playerRef.current = null;
        };
    }, [autoPlay, videoId]);

    useEffect(() => {
        window.clearInterval(progressTimer.current);

        if (!ready || !playing) {
            return undefined;
        }

        progressTimer.current = window.setInterval(syncProgress, 250);

        return () => window.clearInterval(progressTimer.current);
    }, [playing, ready, syncProgress]);

    const timelineDuration = maxSeconds != null ? Math.min(maxSeconds, duration || maxSeconds) : duration;
    const progressPercent = timelineDuration > 0 ? Math.min(100, (currentTime / timelineDuration) * 100) : 0;

    return (
        <div
            ref={containerRef}
            className={`stream-player protected-video ${isFullscreen ? 'is-fullscreen' : ''} ${className}`.trim()}
            onContextMenu={blockMediaInteraction}
            onCopy={blockMediaInteraction}
            onMouseMove={() => revealControls(true)}
            onTouchStart={() => revealControls(true)}
        >
            <div className="stream-player__media" aria-label={title}>
                <div ref={mountRef} className="stream-player__mount" title={title} />
            </div>

            <button
                type="button"
                className="stream-player__tap-layer"
                aria-label={playing ? 'Pause video' : 'Play video'}
                onClick={togglePlay}
                onContextMenu={blockMediaInteraction}
            />

            {!playing && ready && (
                <button
                    type="button"
                    className="stream-player__center-play"
                    aria-label="Play video"
                    onClick={(event) => {
                        event.stopPropagation();
                        playVideo();
                    }}
                    onContextMenu={blockMediaInteraction}
                >
                    <svg viewBox="0 0 24 24" className="h-16 w-16 fill-white" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            )}

            <div
                className={`stream-player__chrome ${controlsVisible ? 'is-visible' : ''}`}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <label className="stream-player__progress">
                    <span className="sr-only">Seek video</span>
                    <input
                        type="range"
                        min={0}
                        max={timelineDuration || 0}
                        step={0.1}
                        value={Math.min(currentTime, timelineDuration || 0)}
                        disabled={!ready || timelineDuration <= 0}
                        onChange={(event) => seekTo(event.target.value, event)}
                        className="stream-player__progress-input"
                    />
                    <span
                        className="stream-player__progress-fill"
                        style={{ width: `${progressPercent}%` }}
                        aria-hidden="true"
                    />
                </label>

                <div className="stream-player__toolbar">
                    <div className="stream-player__toolbar-group">
                        <button
                            type="button"
                            className="stream-player__icon-btn"
                            aria-label={`Rewind ${YOUTUBE_SEEK_STEP_SEC} seconds`}
                            disabled={!ready}
                            onClick={(event) => seekBy(-YOUTUBE_SEEK_STEP_SEC, event)}
                        >
                            <SkipIcon direction="back" />
                        </button>
                        <button
                            type="button"
                            className="stream-player__icon-btn stream-player__icon-btn--primary"
                            aria-label={playing ? 'Pause video' : 'Play video'}
                            disabled={!ready}
                            onClick={(event) => {
                                event.stopPropagation();
                                togglePlay();
                            }}
                        >
                            {playing ? (
                                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                                    <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            )}
                        </button>
                        <button
                            type="button"
                            className="stream-player__icon-btn"
                            aria-label={`Forward ${YOUTUBE_SEEK_STEP_SEC} seconds`}
                            disabled={!ready}
                            onClick={(event) => seekBy(YOUTUBE_SEEK_STEP_SEC, event)}
                        >
                            <SkipIcon direction="forward" />
                        </button>
                    </div>

                    <div className="stream-player__toolbar-group stream-player__toolbar-group--end">
                        <span className="stream-player__time">
                            {formatPlaybackTime(currentTime)} / {formatPlaybackTime(timelineDuration)}
                        </span>
                        <VideoFullscreenButton
                            isFullscreen={isFullscreen}
                            disabled={!ready}
                            onClick={toggleFullscreen}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
