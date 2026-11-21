<?php

namespace App\Services;

class ContentProtectionService
{
    public static function isEmbeddableProvider(?string $url): bool
    {
        return $url !== null && $url !== '' && (bool) preg_match('/youtube\.com|youtu\.be|vimeo\.com/i', $url);
    }

    public static function htmlHasEmbeddableVideo(?string $html): bool
    {
        return count(self::extractEmbeddedPlaybacks($html)) > 0;
    }

    public static function embeddedPlaybackAt(?string $html, int $slot): ?array
    {
        return self::extractEmbeddedPlaybacks($html)[$slot] ?? null;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public static function extractEmbeddedPlaybacks(?string $html): array
    {
        if ($html === null || $html === '') {
            return [];
        }

        $playbacks = [];
        $pattern = '/<figure[^>]*wp-block-embed(?:-youtube|-vimeo)?[^>]*>.*?<\/figure>|<iframe\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>(?:\s*<\/iframe>)?/is';

        if (! preg_match_all($pattern, $html, $matches)) {
            return [];
        }

        foreach ($matches[0] as $index => $fragment) {
            $url = $matches[1][$index] ?? '';
            if ($url === '' && preg_match('/\bsrc=["\']([^"\']+)["\']/i', $fragment, $srcMatch)) {
                $url = $srcMatch[1];
            }

            if ($url === '') {
                continue;
            }

            $playback = PlaybackService::resolve($url, '');
            if ($playback !== null) {
                $playbacks[] = $playback;
            }
        }

        return $playbacks;
    }

    public static function sanitizeHtml(?string $html): ?string
    {
        if ($html === null || $html === '') {
            return $html;
        }

        $slot = 0;
        $nextSlot = function () use (&$slot): string {
            return '<div data-protected-video-slot="'.($slot++).'"></div>';
        };

        $html = preg_replace_callback(
            '/<figure[^>]*wp-block-embed(?:-youtube|-vimeo)?[^>]*>.*?<\/figure>/is',
            function (array $match) use ($nextSlot): string {
                return self::isEmbeddableFragment($match[0]) ? $nextSlot() : $match[0];
            },
            $html,
        ) ?? $html;

        $html = preg_replace_callback(
            '/<iframe\b[^>]*\bsrc=["\']([^"\']+)["\'][^>]*>(?:\s*<\/iframe>)?/is',
            function (array $match) use ($nextSlot): string {
                return self::isEmbeddableProvider($match[1]) ? $nextSlot() : $match[0];
            },
            $html,
        ) ?? $html;

        $html = preg_replace(
            '/href=["\']https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)[^"\']*["\']/i',
            'href="#"',
            $html,
        ) ?? $html;

        $html = preg_replace(
            '#https?://(?:www\.)?(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)[a-zA-Z0-9_-]{11}[^\s<"]*#i',
            '',
            $html,
        ) ?? $html;

        $html = preg_replace(
            '#https?://(?:www\.)?youtube-nocookie\.com/embed/[a-zA-Z0-9_-]{11}[^\s<"]*#i',
            '',
            $html,
        ) ?? $html;

        $html = preg_replace(
            '#https?://(?:www\.)?vimeo\.com/(?:video/)?\d+[^\s<"]*#i',
            '',
            $html,
        ) ?? $html;

        return $html;
    }

    public static function publicVideoUrl(?string $videoUrl): ?string
    {
        if (self::isEmbeddableProvider($videoUrl)) {
            return null;
        }

        return $videoUrl ?: null;
    }

    private static function isEmbeddableFragment(string $html): bool
    {
        if (! preg_match('/\bsrc=["\']([^"\']+)["\']/i', $html, $match)) {
            return false;
        }

        return self::isEmbeddableProvider($match[1]);
    }
}
