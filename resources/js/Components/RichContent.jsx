import EmbeddedVideoSlot from '@/Components/EmbeddedVideoSlot';
import { sanitizeMediaHtml } from '@/lib/sanitize-media-html';

const PROTECTED_VIDEO_SLOT_PATTERN = /<div data-protected-video-slot="(\d+)"><\/div>/gi;

function parseSegments(html) {
    const segments = [];
    let lastIndex = 0;

    for (const match of (html || '').matchAll(PROTECTED_VIDEO_SLOT_PATTERN)) {
        if (match.index > lastIndex) {
            segments.push({ type: 'html', content: html.slice(lastIndex, match.index) });
        }

        segments.push({ type: 'slot', slot: Number(match[1]) });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < (html || '').length) {
        segments.push({ type: 'html', content: html.slice(lastIndex) });
    }

    return segments;
}

export default function RichContent({ html, className = '', embedPlaybackUrl, hiddenSlots = [] }) {
    if (!html) {
        return null;
    }

    const hidden = new Set(hiddenSlots);
    const segments = parseSegments(html);

    return (
        <div className={`rich-content-protected ${className}`.trim()}>
            {segments.map((segment, index) => {
                if (segment.type === 'html') {
                    return (
                        <div
                            key={`html-${index}`}
                            className="rich-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeMediaHtml(segment.content) }}
                        />
                    );
                }

                if (!embedPlaybackUrl || hidden.has(segment.slot)) {
                    return null;
                }

                return (
                    <EmbeddedVideoSlot
                        key={`slot-${segment.slot}-${index}`}
                        slot={segment.slot}
                        playbackUrl={embedPlaybackUrl(segment.slot)}
                    />
                );
            })}
        </div>
    );
}
