<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImageCardTest extends TestCase
{
    public function test_card_route_serves_a_smaller_jpeg_and_rejects_traversal(): void
    {
        $source = imagecreatetruecolor(1400, 800);
        $color = imagecolorallocate($source, 20, 90, 160);
        imagefilledrectangle($source, 0, 0, 1399, 799, $color);

        $relative = 'courses/card-size-check.png';
        $absolute = Storage::disk('public')->path($relative);
        if (! is_dir(dirname($absolute))) {
            mkdir(dirname($absolute), 0755, true);
        }
        imagepng($source, $absolute);
        imagedestroy($source);

        $response = $this->get(route('media.card', ['width' => 960, 'path' => $relative]));
        $response->assertOk();
        $this->assertStringContainsString('image/jpeg', (string) $response->headers->get('Content-Type'));

        $cached = Storage::disk('public')->path('cache/cards/960/courses/card-size-check.jpg');
        $this->assertFileExists($cached);
        $size = getimagesize($cached);
        $this->assertSame(960, $size[0]);
        $this->assertSame(IMAGETYPE_JPEG, $size[2]);

        $this->get('/media/card/960/../.env')->assertNotFound();

        @unlink($absolute);
        Storage::disk('public')->delete('cache/cards/960/courses/card-size-check.jpg');
    }
}
