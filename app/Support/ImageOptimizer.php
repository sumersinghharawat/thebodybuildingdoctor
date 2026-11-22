<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizer
{
    public static function storeUpload(UploadedFile $file, string $folder): string
    {
        $mime = (string) $file->getMimeType();
        if (! str_starts_with($mime, 'image/') || $mime === 'image/gif') {
            return $file->store($folder, 'public');
        }

        $binary = self::jpegBinary($file->getRealPath(), 1600, 82);
        if ($binary === null) {
            return $file->store($folder, 'public');
        }

        $path = trim($folder, '/').'/'.Str::random(40).'.jpg';
        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    public static function writeCard(string $source, string $target, int $maxWidth): bool
    {
        $binary = self::jpegBinary($source, $maxWidth, 78);
        if ($binary === null) {
            return false;
        }

        $directory = dirname($target);
        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            return false;
        }

        return file_put_contents($target, $binary) !== false;
    }

    public static function jpegBinary(string $source, int $maxWidth, int $quality): ?string
    {
        $info = @getimagesize($source);
        if ($info === false) {
            return null;
        }

        $src = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($source),
            IMAGETYPE_PNG => @imagecreatefrompng($source),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($source) : false,
            IMAGETYPE_GIF => @imagecreatefromgif($source),
            default => false,
        };

        if ($src === false) {
            return null;
        }

        $width = imagesx($src);
        $height = imagesy($src);
        if ($width < 1 || $height < 1) {
            imagedestroy($src);

            return null;
        }

        $targetWidth = min($maxWidth, $width);
        $targetHeight = (int) max(1, round($height * ($targetWidth / $width)));
        $dst = imagecreatetruecolor($targetWidth, $targetHeight);
        if ($dst === false) {
            imagedestroy($src);

            return null;
        }

        $background = imagecolorallocate($dst, 11, 15, 20);
        imagefilledrectangle($dst, 0, 0, $targetWidth, $targetHeight, $background);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        imagedestroy($src);

        ob_start();
        $written = imagejpeg($dst, null, $quality);
        $binary = ob_get_clean();
        imagedestroy($dst);

        if ($written !== true || ! is_string($binary) || $binary === '') {
            return null;
        }

        return $binary;
    }
}
