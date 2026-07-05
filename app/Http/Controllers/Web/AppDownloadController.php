<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Support\LandingAppSection;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AppDownloadController extends Controller
{
    public function __invoke(): StreamedResponse
    {
        $path = LandingAppSection::apkStoragePath(LandingAppSection::storedSettings());

        if ($path === null || ! Storage::disk('public')->exists($path)) {
            abort(404, 'Android app not available.');
        }

        $filename = (string) config('marketing.android_apk_filename', 'the-bodybuilding-doctor.apk');

        return Storage::disk('public')->download($path, $filename, [
            'Content-Type' => 'application/vnd.android.package-archive',
        ]);
    }
}
