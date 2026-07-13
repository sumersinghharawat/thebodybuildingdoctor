<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Services\FaceAuth\FaceEnrollmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserFaceLockTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_generate_face_enrollment_link(): void
    {
        $admin = User::factory()->create(['roles' => ['admin']]);
        $member = User::factory()->create(['roles' => ['member']]);

        $response = $this->actingAs($admin)->postJson("/api/admin/users/{$member->id}/face-enroll-link", [
            'hours' => 24,
        ]);

        $response->assertOk();
        $this->assertNotEmpty($response->json('url'));
        $this->assertStringContainsString('profile', $response->json('url'));
    }

    public function test_non_admin_cannot_generate_face_enrollment_link(): void
    {
        $other = User::factory()->create(['roles' => ['member']]);
        $member = User::factory()->create(['roles' => ['member']]);

        $response = $this->actingAs($other)->postJson("/api/admin/users/{$member->id}/face-enroll-link");

        $response->assertForbidden();
    }

    public function test_admin_can_revoke_face_lock(): void
    {
        $admin = User::factory()->create(['roles' => ['admin']]);
        $member = User::factory()->create(['roles' => ['member']]);
        $samples = array_fill(0, 3, array_fill(0, 128, 0.5));

        app(FaceEnrollmentService::class)->enroll($member, $samples);
        $this->assertTrue($member->fresh()->hasFaceRegistered());

        $response = $this->actingAs($admin)->deleteJson("/api/admin/users/{$member->id}/face-lock");

        $response->assertOk();
        $this->assertFalse($member->fresh()->hasFaceRegistered());
    }

    public function test_serialized_user_includes_face_registration_flag(): void
    {
        $admin = User::factory()->create(['roles' => ['admin']]);
        $member = User::factory()->create(['roles' => ['member']]);
        $samples = array_fill(0, 3, array_fill(0, 128, 0.5));

        app(FaceEnrollmentService::class)->enroll($member, $samples);

        $response = $this->actingAs($admin)->getJson("/api/admin/users/{$member->id}");

        $response->assertOk()->assertJsonPath('user.hasFaceRegistered', true);
    }
}
