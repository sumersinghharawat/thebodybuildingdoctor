const MEDIA_HOST_PATTERN = /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)/i;
const MEDIA_URL_PATTERN =
    /https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)\S*/gi;
const MEDIA_TEXT_PATTERN = /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)/i;

const PROTECTED_SELECTOR = '.rich-content-protected, .protected-video, .rich-content';

function cleanMediaFromText(text) {
    return (text || '').replace(MEDIA_URL_PATTERN, '').replace(/\s{2,}/g, ' ').trim();
}

function selectionContainsMediaUrl() {
    const selection = document.getSelection()?.toString() || '';
    return MEDIA_TEXT_PATTERN.test(selection);
}

function blockMediaInteraction(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
        return;
    }

    if (!target.closest(PROTECTED_SELECTOR)) {
        return;
    }

    if (event.type === 'copy' || event.type === 'cut') {
        if (!selectionContainsMediaUrl()) {
            return;
        }

        event.preventDefault();
        if (event.clipboardData) {
            const cleaned = cleanMediaFromText(document.getSelection()?.toString());
            event.clipboardData.setData('text/plain', cleaned);
        }
        return;
    }

    if (event.type === 'contextmenu') {
        event.preventDefault();
        event.stopPropagation();
    }
}

export function installMediaLinkProtection() {
    if (typeof window === 'undefined' || window.__mediaLinkProtectionInstalled) {
        return;
    }

    window.__mediaLinkProtectionInstalled = true;

    document.addEventListener(
        'click',
        (event) => {
            const anchor = event.target.closest('a[href]');
            if (!anchor) {
                return;
            }

            const href = anchor.getAttribute('href') || '';
            if (MEDIA_HOST_PATTERN.test(href) && href !== '#') {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        true,
    );

    document.addEventListener(
        'auxclick',
        (event) => {
            const anchor = event.target.closest('a[href]');
            if (!anchor) {
                return;
            }

            const href = anchor.getAttribute('href') || '';
            if (MEDIA_HOST_PATTERN.test(href) && href !== '#') {
                event.preventDefault();
                event.stopPropagation();
            }
        },
        true,
    );

    document.addEventListener('copy', blockMediaInteraction, true);
    document.addEventListener('cut', blockMediaInteraction, true);
    document.addEventListener('contextmenu', blockMediaInteraction, true);

    document.addEventListener('copy', (event) => {
        if (!selectionContainsMediaUrl()) {
            return;
        }

        event.preventDefault();
        const cleaned = cleanMediaFromText(document.getSelection()?.toString());
        event.clipboardData?.setData('text/plain', cleaned);
    });
}
