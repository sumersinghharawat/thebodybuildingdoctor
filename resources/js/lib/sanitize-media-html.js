const YOUTUBE_IFRAME_PATTERN = /<iframe\b[^>]*(?:youtube\.com|youtu\.be|youtube-nocookie\.com)[^>]*>[\s\S]*?<\/iframe>/gi;
const VIMEO_IFRAME_PATTERN = /<iframe\b[^>]*vimeo\.com[^>]*>[\s\S]*?<\/iframe>/gi;
const MEDIA_HREF_PATTERN =
    /href=["']https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)[^"']*["']/gi;
const MEDIA_URL_PATTERN =
    /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)\S*/gi;

export function sanitizeMediaHtml(html) {
    if (!html) {
        return html;
    }

    return html
        .replace(YOUTUBE_IFRAME_PATTERN, '')
        .replace(VIMEO_IFRAME_PATTERN, '')
        .replace(MEDIA_HREF_PATTERN, 'href="#"')
        .replace(MEDIA_URL_PATTERN, '');
}
