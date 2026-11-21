export function resolveVideoPlayback(videoUrl, playbackUrl = null) {
    const url = (videoUrl || '').trim();
    if (!url) {
        return null;
    }

    if (/youtube\.com|youtu\.be/i.test(url)) {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
            return { provider: 'youtube', videoId: match[1] };
        }

        return null;
    }

    if (/vimeo\.com/i.test(url)) {
        const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (match) {
            return { provider: 'vimeo', vimeoId: match[1] };
        }

        return null;
    }

    if (/\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url) || url.startsWith('http')) {
        return { provider: 'file', playbackUrl: playbackUrl || url };
    }

    return null;
}
