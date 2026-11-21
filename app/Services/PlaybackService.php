<?php

namespace App\Services;

class PlaybackService
{
    public static function resolve(string $videoUrl, string $streamPath): ?array
    {
        $url = trim($videoUrl);
        if ($url === '') {
            return null;
        }

        if (preg_match('/youtube\.com|youtu\.be/i', $url)) {
            if (preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $url, $m)) {
                return ['provider' => 'youtube', 'videoId' => $m[1]];
            }

            return null;
        }

        if (preg_match('/vimeo\.com/i', $url)) {
            if (preg_match('/vimeo\.com\/(?:video\/)?(\d+)/', $url, $m)) {
                return ['provider' => 'vimeo', 'vimeoId' => $m[1]];
            }

            return null;
        }

        if (preg_match('/\.(mp4|mov|webm|m4v)(\?|#|$)/i', $url) || str_starts_with($url, 'http')) {
            return ['provider' => 'file', 'playbackUrl' => $streamPath];
        }

        return null;
    }
}
