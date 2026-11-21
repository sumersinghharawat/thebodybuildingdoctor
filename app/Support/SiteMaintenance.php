<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\Exceptions\InvalidFormatException;

class SiteMaintenance
{
    public static function isActive(): bool
    {
        if (! config('maintenance.enabled')) {
            return false;
        }

        $until = static::until();

        if ($until && now()->greaterThanOrEqualTo($until)) {
            return false;
        }

        return true;
    }

    public static function until(): ?Carbon
    {
        $raw = trim((string) config('maintenance.until'));

        if ($raw === '') {
            return null;
        }

        try {
            $tz = config('app.timezone') ?: 'UTC';

            // Time-only values (e.g. "22:00" or "10:00 PM") mean today in app timezone.
            if (preg_match('/^\d{1,2}:\d{2}(\s*[AaPp][Mm])?$/', $raw) === 1) {
                return Carbon::parse($raw, $tz)->setDateFrom(now($tz));
            }

            return Carbon::parse($raw, $tz);
        } catch (InvalidFormatException|\Throwable) {
            return null;
        }
    }
}
