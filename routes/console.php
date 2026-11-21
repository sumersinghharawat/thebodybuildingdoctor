<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('queue:work --stop-when-empty --max-time=50 --tries=3 --backoff=15')
    ->everyMinute()
    ->withoutOverlapping(5)
    ->when(fn () => ! in_array(config('queue.default'), ['sync', 'deferred', 'null'], true));
