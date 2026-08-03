<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Site under maintenance
    |--------------------------------------------------------------------------
    |
    | When enabled, visitors see the maintenance page instead of the site.
    | Set SITE_MAINTENANCE_UNTIL so the site goes live automatically after
    | that time (APP_TIMEZONE), even if SITE_UNDER_MAINTENANCE is still true.
    |
    | Examples for SITE_MAINTENANCE_UNTIL:
    |   2026-08-03 22:00
    |   2026-08-03 10:00 PM
    |   22:00
    |   10:00 PM
    |
    */

    'enabled' => (bool) env('SITE_UNDER_MAINTENANCE', false),

    'until' => env('SITE_MAINTENANCE_UNTIL'),

];
