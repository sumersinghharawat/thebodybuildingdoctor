<?php

namespace Tests\Feature;

use App\Mail\InquiryReceivedMail;
use App\Models\Course;
use App\Models\SiteSetting;
use App\Models\User;
use App\Support\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class CourseAccessRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_request_course_access_and_admin_is_emailed(): void
    {
        Mail::fake();

        SiteSetting::query()->create([
            'key' => GeneralSettings::SETTING_KEY,
            'value' => json_encode([
                'currency' => 'EUR',
                'notificationEmail' => 'admin@example.com',
            ]),
        ]);

        $user = User::factory()->create([
            'roles' => ['media_channel'],
        ]);

        $course = Course::query()->create([
            'id' => 'course-test-1',
            'title' => 'Test Course',
            'slug' => 'test-course',
            'description' => 'Description',
            'published' => true,
            'sort_order' => 1,
        ]);

        $response = $this->actingAs($user)->post(route('learn.courses.request', $course->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('inquiries', [
            'email' => $user->email,
            'course_id' => $course->id,
            'status' => 'new',
        ]);

        Mail::assertSent(InquiryReceivedMail::class);
    }
}
