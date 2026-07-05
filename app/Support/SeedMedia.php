<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SeedMedia
{
    public static function seedRoot(): string
    {
        return database_path('seeders/media');
    }

    public static function manifestPath(): string
    {
        return database_path('seeders/data/media-manifest.json');
    }

    /**
     * @return array<string, string> original URL => storage-relative path
     */
    public static function manifestForSnapshot(array $data): array
    {
        $manifest = self::loadManifest();
        if ($manifest !== []) {
            return $manifest;
        }

        return self::buildManifestFromSeedFiles($data);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    public static function collectTargetsFromSnapshot(array $data): array
    {
        $targets = [];

        foreach ($data['courses'] ?? [] as $row) {
            self::addThumbnailTarget($targets, $row['thumbnailUrl'] ?? null, 'courses', (string) ($row['id'] ?? $row['_id'] ?? ''));
        }

        foreach ($data['lessons'] ?? [] as $row) {
            self::addThumbnailTarget($targets, $row['thumbnailUrl'] ?? null, 'lessons', (string) ($row['id'] ?? $row['_id'] ?? ''));
        }

        foreach ($data['blogs'] ?? [] as $row) {
            self::addThumbnailTarget($targets, $row['thumbnailUrl'] ?? null, 'blogs', (string) ($row['id'] ?? $row['_id'] ?? ''));
        }

        foreach (['courses' => 'descriptionHtml', 'lessons' => 'contentHtml', 'blogs' => 'contentHtml'] as $collection => $field) {
            foreach ($data[$collection] ?? [] as $row) {
                if (empty($row[$field])) {
                    continue;
                }

                preg_match_all('/\bhttps?:\/\/[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|gif)\b/i', (string) $row[$field], $matches);
                foreach ($matches[0] as $url) {
                    self::addContentTarget($targets, $url);
                }
            }
        }

        return array_filter($targets, fn (string $path) => $path !== '');
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, string>
     */
    public static function buildManifestFromSeedFiles(array $data): array
    {
        $manifest = [];
        $root = self::seedRoot();

        foreach (self::collectTargetsFromSnapshot($data) as $url => $relativePath) {
            if (is_file($root.'/'.$relativePath)) {
                $manifest[$url] = $relativePath;
            }
        }

        return $manifest;
    }

    public static function saveManifest(array $manifest): void
    {
        $payload = [
            'generatedAt' => now()->toIso8601String(),
            'urls' => $manifest,
        ];

        file_put_contents(
            self::manifestPath(),
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n",
        );
    }

    /**
     * @param  array<string, string>  $targets
     */
    public static function addThumbnailTarget(array &$targets, ?string $url, string $folder, string $id): void
    {
        if ($url === null || $url === '' || $id === '') {
            return;
        }

        $ext = self::guessExtension($url);
        $targets[$url] = "{$folder}/{$id}.{$ext}";
    }

    /**
     * @param  array<string, string>  $targets
     */
    public static function addContentTarget(array &$targets, string $url): void
    {
        if (isset($targets[$url])) {
            return;
        }

        $hash = substr(sha1($url), 0, 16);
        $ext = self::guessExtension($url);
        $targets[$url] = "content/{$hash}.{$ext}";
    }

    /**
     * @return array<string, string>
     */
    public static function loadManifest(): array
    {
        $path = self::manifestPath();
        if (! is_file($path)) {
            return [];
        }

        $data = json_decode(file_get_contents($path), true);

        return is_array($data['urls'] ?? null) ? $data['urls'] : [];
    }

    public static function publishToStorage(): int
    {
        $root = self::seedRoot();
        if (! is_dir($root)) {
            return 0;
        }

        $disk = Storage::disk('public');
        $published = 0;

        foreach (File::allFiles($root) as $file) {
            $relative = str_replace('\\', '/', Str::after($file->getPathname(), $root.'/'));
            if ($relative === $file->getPathname()) {
                continue;
            }

            $contents = file_get_contents($file->getPathname());
            if ($contents === false) {
                continue;
            }

            if (! $disk->exists($relative) || $disk->get($relative) !== $contents) {
                $disk->put($relative, $contents);
                $published++;
            }
        }

        return $published;
    }

    public static function publicSrcForPath(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }

    public static function rewriteHtml(?string $html, array $manifest): ?string
    {
        if ($html === null || $html === '' || $manifest === []) {
            return $html;
        }

        $rewritten = $html;
        uksort($manifest, fn (string $a, string $b) => strlen($b) <=> strlen($a));

        foreach ($manifest as $originalUrl => $path) {
            $rewritten = str_replace($originalUrl, self::publicSrcForPath($path), $rewritten);
        }

        return $rewritten;
    }

    public static function pathForUrl(?string $url, array $manifest): ?string
    {
        if ($url === null || $url === '') {
            return null;
        }

        return $manifest[$url] ?? null;
    }

    public static function guessExtension(string $url, ?string $contentType = null): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $ext = strtolower(pathinfo((string) $path, PATHINFO_EXTENSION));

        if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
            return $ext === 'jpeg' ? 'jpg' : $ext;
        }

        return match (true) {
            str_contains((string) $contentType, 'png') => 'png',
            str_contains((string) $contentType, 'webp') => 'webp',
            str_contains((string) $contentType, 'gif') => 'gif',
            default => 'jpg',
        };
    }

    public static function download(string $url, string $destination): bool
    {
        foreach (self::alternateUrls($url) as $candidate) {
            if (self::downloadOnce($candidate, $destination)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return list<string>
     */
    private static function alternateUrls(string $url): array
    {
        $urls = [$url];

        if (str_contains($url, 'thebodybuildingdoctor.in')) {
            $urls[] = str_replace('thebodybuildingdoctor.in', 'triotradellc.com', $url);
        }

        return array_values(array_unique($urls));
    }

    private static function downloadOnce(string $url, string $destination): bool
    {
        try {
            File::ensureDirectoryExists(dirname($destination));

            if (is_file($destination)) {
                @unlink($destination);
            }

            $response = Http::timeout(60)
                ->withHeaders(['User-Agent' => 'TBBD-SeedMedia/1.0'])
                ->withOptions(['sink' => $destination])
                ->get($url);

            if (! $response->successful() || ! is_file($destination)) {
                if (is_file($destination)) {
                    @unlink($destination);
                }

                return false;
            }

            return filesize($destination) >= 100;
        } catch (\Throwable) {
            if (is_file($destination)) {
                @unlink($destination);
            }

            return false;
        }
    }
}
