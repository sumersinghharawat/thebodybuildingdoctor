<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Support\LandingAppSection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AppDownloadTest extends TestCase
{
    use RefreshDatabase;

    public function test_android_apk_downloads_with_apk_filename_and_content_type(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('apps/test.apk', 'fake-apk-binary');

        SiteSetting::query()->create([
            'key' => LandingAppSection::SETTING_KEY,
            'value' => json_encode([
                'appDownloadUrl' => '/storage/apps/test.apk',
            ]),
        ]);

        $response = $this->get(route('app.download'));

        $response->assertOk();
        $response->assertHeader('content-type', 'application/vnd.android.package-archive');
        $response->assertDownload('the-bodybuilding-doctor.apk');
    }

    public function test_android_download_returns_404_when_no_apk_configured(): void
    {
        $this->get(route('app.download'))->assertNotFound();
    }
}
