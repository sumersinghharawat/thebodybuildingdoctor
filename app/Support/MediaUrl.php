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
}
