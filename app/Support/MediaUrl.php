<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class MediaUrl
{
    public static function resolve(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        if (str_starts_with($value, '/storage/')) {
            return $value;
        }

        return Storage::disk('public')->url($value);
    }

    public static function storagePath(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if (str_starts_with($value, '/storage/')) {
            return ltrim(substr($value, strlen('/storage/')), '/');
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            $prefix = rtrim(Storage::disk('public')->url(''), '/').'/';

            if (str_starts_with($value, $prefix)) {
                return substr($value, strlen($prefix));
            }
        }

        return $value;
    }

    /**
     * Smaller JPEG for cards and video posters. External images stay unchanged.
     */
    public static function card(?string $value, int $width = 960): string
    {
        $resolved = self::resolve($value) ?? '';
        if ($resolved === '') {
            return '';
        }

        $path = self::publicImagePath($resolved);
        if ($path === null) {
            return $resolved;
        }

        if (Storage::disk('public')->exists($path)) {
            return route('media.card', ['width' => $width, 'path' => $path]);
        }

        $host = parse_url($resolved, PHP_URL_HOST);
        if (! is_string($host) || ! self::isCardHost($host) || ! str_starts_with($resolved, 'https://')) {
            return $resolved;
        }

        return route('media.card', ['width' => $width, 'path' => $path]).'?host='.rawurlencode($host);
    }

    public static function isCardHost(string $host): bool
    {
        $host = strtolower($host);

        return in_array($host, self::cardHosts(), true);
    }

    /**
     * @return list<string>
     */
    public static function cardHosts(): array
    {
        $configured = config('media.card_hosts', []);
        $hosts = is_array($configured) ? $configured : [];
        $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
        if (is_string($appHost) && $appHost !== '') {
            $hosts[] = $appHost;
        }

        return array_values(array_unique(array_map(
            fn ($host) => strtolower((string) $host),
            array_filter($hosts, fn ($host) => is_string($host) && $host !== ''),
        )));
    }

    public static function publicImagePath(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        $path = null;
        if (preg_match('~/storage/([^?#]+)~', $value, $matches)) {
            $path = rawurldecode($matches[1]);
        } elseif (! str_contains($value, '://') && ! str_starts_with($value, '/')) {
            $path = $value;
        }

        if ($path === null) {
            return null;
        }

        $path = ltrim(str_replace('\\', '/', $path), '/');
        if ($path === '' || str_contains($path, '..') || ! preg_match('/\.(jpe?g|png|webp|gif)$/i', $path)) {
            return null;
        }

        return $path;
    }
}
