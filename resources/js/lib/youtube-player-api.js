export const YOUTUBE_SEEK_STEP_SEC = 10;

let apiPromise = null;

export function loadYouTubePlayerApi() {
    if (typeof window === 'undefined') {
        return Promise.resolve(null);
    }

    if (window.YT?.Player) {
        return Promise.resolve(window.YT);
    }

    if (apiPromise) {
        return apiPromise;
    }

    apiPromise = new Promise((resolve) => {
        const finish = () => resolve(window.YT);

        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previousReady?.();
            finish();
        };

        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);
        }
    });

    return apiPromise;
}

export function formatPlaybackTime(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
        return '0:00';
    }

    const seconds = Math.floor(totalSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
    }

    return `${minutes}:${String(remainder).padStart(2, '0')}`;
}
