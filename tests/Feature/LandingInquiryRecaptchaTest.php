<?php

namespace Tests\Feature;

use App\Mail\InquiryReceivedMail;
use App\Models\SiteSetting;
use App\Support\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LandingInquiryRecaptchaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SiteSetting::query()->create([
            'key' => GeneralSettings::SETTING_KEY,
            'value' => json_encode([
                'currency' => 'INR',
                'notificationEmail' => 'admin@example.com',
            ]),
        ]);
    }

    public function test_landing_inquiry_submits_without_recaptcha_when_not_configured(): void
    {
        Mail::fake();
        config([
            'services.recaptcha.site_key' => null,
            'services.recaptcha.secret_key' => null,
        ]);

        $response = $this->post(route('inquiries.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+919876543210',
            'type' => 'both',
            'message' => 'Interested in mentorship.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('inquiries', [
            'email' => 'jane@example.com',
            'name' => 'Jane Doe',
        ]);
        Mail::assertQueued(InquiryReceivedMail::class);
    }

    public function test_landing_inquiry_requires_valid_recaptcha_when_configured(): void
    {
        Mail::fake();
        config([
            'services.recaptcha.site_key' => 'test-site-key',
            'services.recaptcha.secret_key' => 'test-secret-key',
            'services.recaptcha.min_score' => 0.5,
        ]);

        Http::fake([
            'www.google.com/recaptcha/api/siteverify' => Http::response([
                'success' => true,
                'score' => 0.9,
                'action' => 'inquiry',
            ]),
        ]);

        $response = $this->post(route('inquiries.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+919876543210',
            'type' => 'both',
            'message' => 'Interested in mentorship.',
            'recaptchaToken' => 'valid-token',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('inquiries', [
            'email' => 'jane@example.com',
        ]);
    }

    public function test_landing_inquiry_rejects_failed_recaptcha(): void
    {
        config([
            'services.recaptcha.site_key' => 'test-site-key',
            'services.recaptcha.secret_key' => 'test-secret-key',
        ]);

        Http::fake([
            'www.google.com/recaptcha/api/siteverify' => Http::response([
                'success' => false,
            ]),
        ]);

        $response = $this->post(route('inquiries.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+919876543210',
            'type' => 'both',
            'recaptchaToken' => 'bad-token',
        ]);

        $response->assertSessionHasErrors('recaptchaToken');
        $this->assertDatabaseMissing('inquiries', [
            'email' => 'jane@example.com',
        ]);
    }
}
