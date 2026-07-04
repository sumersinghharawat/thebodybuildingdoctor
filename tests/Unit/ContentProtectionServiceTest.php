<?php

namespace Tests\Unit;

use App\Services\ContentProtectionService;
use PHPUnit\Framework\TestCase;

class ContentProtectionServiceTest extends TestCase
{
    public function test_it_strips_youtube_urls_from_public_video_fields(): void
    {
        $this->assertNull(
            ContentProtectionService::publicVideoUrl('https://www.youtube.com/embed/abc12345678'),
        );
        $this->assertSame(
            'https://cdn.example.com/intro.mp4',
            ContentProtectionService::publicVideoUrl('https://cdn.example.com/intro.mp4'),
        );
    }

    public function test_it_replaces_youtube_iframes_with_slot_placeholders(): void
    {
        $html = '<p>Intro</p><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed"></iframe>';

        $sanitized = ContentProtectionService::sanitizeHtml($html);

        $this->assertStringNotContainsString('youtube.com', $sanitized);
        $this->assertStringContainsString('data-protected-video-slot="0"', $sanitized);
    }

    public function test_it_extracts_embedded_playbacks_in_order(): void
    {
        $html = '<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>'
            .'<iframe src="https://www.youtube.com/embed/abc12345678"></iframe>';

        $playbacks = ContentProtectionService::extractEmbeddedPlaybacks($html);

        $this->assertCount(2, $playbacks);
        $this->assertSame('youtube', $playbacks[0]['provider']);
        $this->assertSame('dQw4w9WgXcQ', $playbacks[0]['videoId']);
        $this->assertSame('abc12345678', $playbacks[1]['videoId']);
    }

    public function test_it_removes_bare_youtube_links_from_html(): void
    {
        $html = '<p>Watch at https://www.youtube.com/watch?v=dQw4w9WgXcQ today.</p>';

        $sanitized = ContentProtectionService::sanitizeHtml($html);

        $this->assertStringNotContainsString('youtube.com', $sanitized);
    }
}
