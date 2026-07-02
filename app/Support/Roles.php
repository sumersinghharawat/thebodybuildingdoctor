<?php

namespace App\Support;

class Roles
{
    public const ADMIN = ['administrator', 'admin', 'lms_manager'];

    public const MEDIA_CHANNEL = ['media_channel'];

    public static function parse(mixed $raw): array
    {
        if (! $raw) {
            return [];
        }
        if (is_array($raw)) {
            return array_values(array_filter(array_map('strval', $raw)));
        }
        if (is_string($raw)) {
            return array_values(array_filter(array_map('trim', explode(',', $raw))));
        }

        return [];
    }

    public static function isAdmin(array $roles): bool
    {
        return (bool) array_intersect($roles, self::ADMIN);
    }

    public static function isMediaChannel(array $roles): bool
    {
        return (bool) array_intersect($roles, self::MEDIA_CHANNEL);
    }

    public static function isMediaChannelOnly(array $roles): bool
    {
        return self::isMediaChannel($roles) && ! self::isAdmin($roles);
    }

    public static function hasAppAccess(array $roles): bool
    {
        return self::isAdmin($roles) || self::isMediaChannel($roles);
    }

    public static function primary(array $roles): ?string
    {
        foreach ($roles as $role) {
            if (in_array($role, self::ADMIN, true)) {
                return $role;
            }
        }

        return self::isMediaChannel($roles) ? 'media_channel' : null;
    }
}
