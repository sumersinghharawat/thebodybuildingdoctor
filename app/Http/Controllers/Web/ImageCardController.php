<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\ImageOptimizer;
use App\Support\MediaUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ImageCardController extends Controller
{
    public function __invoke(Request $request, int $width, string $path): BinaryFileResponse|RedirectResponse
    {
        abort_unless(in_array($width, [480, 640, 960, 1280], true), 404);

        $relative = MediaUrl::publicImagePath($path);
        abort_if($relative === null, 404);

        $disk = Storage::disk('public');
        $root = realpath($disk->path(''));
        abort_if($root === false, 404);

        $local = $disk->path($relative);
        $source = is_file($local) ? realpath($local) : false;
        $temporary = false;
        if ($source !== false) {
            abort_unless(str_starts_with($source, $root.DIRECTORY_SEPARATOR), 404);
        }

        $host = strtolower((string) $request->query('host', ''));
        $cacheRelative = 'cache/cards/'.$width.'/'.($host !== '' ? $host.'/' : '').preg_replace('/\.[^.]+$/', '.jpg', $relative);
        $target = $disk->path($cacheRelative);

        if (is_file($target) && ($source === false || filemtime($target) >= filemtime($source))) {
            return $this->respond($target);
        }

        if ($source === false) {
            $source = $this->downloadAllowedImage($host, $relative);
            $temporary = $source !== false;
        }

        if ($source === false) {
            if ($host !== '' && MediaUrl::isCardHost($host)) {
                return redirect()->away('https://'.$host.'/storage/'.$relative);
            }

            abort(404);
        }

        try {
            $info = @getimagesize($source);
            if ($info === false) {
                abort(404);
            }

            $bytes = filesize($source) ?: 0;
            if (! $temporary && $info[2] === IMAGETYPE_JPEG && $info[0] <= $width && $bytes > 0 && $bytes < 180_000) {
                return $this->respond($source);
            }

            if (! ImageOptimizer::writeCard($source, $target, $width)) {
                if ($temporary) {
                    abort(404);
                }

                return $this->respond($source);
            }
        } finally {
            if ($temporary) {
                @unlink($source);
            }
        }

        return $this->respond($target);
    }

    private function downloadAllowedImage(string $host, string $relative): string|false
    {
        if ($host === '' || ! MediaUrl::isCardHost($host)) {
            return false;
        }

        $remote = 'https://'.$host.'/storage/'.$relative;
        $response = Http::timeout(12)
            ->withOptions(['allow_redirects' => false])
            ->withHeaders(['Accept' => 'image/*'])
            ->get($remote);

        if (! $response->successful()) {
            return false;
        }

        $body = $response->body();
        if ($body === '' || strlen($body) > 8_000_000 || ! str_starts_with((string) $response->header('Content-Type'), 'image/')) {
            return false;
        }

        $temp = tempnam(sys_get_temp_dir(), 'cardimg');
        if ($temp === false || file_put_contents($temp, $body) === false) {
            return false;
        }

        return $temp;
    }

    private function respond(string $file): BinaryFileResponse
    {
        return response()->file($file, [
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
