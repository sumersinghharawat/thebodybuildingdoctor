<?php

namespace Tests\Feature\FaceAuth;

use App\Models\User;
use App\Services\FaceAuth\FaceRecognitionService;
use App\Support\FaceDescriptorHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaceAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_descriptor_encryption_round_trip(): void
    {
        $helper = app(FaceDescriptorHelper::class);
        $descriptor = array_fill(0, 128, 0.42);

        $encrypted = $helper->encrypt($descriptor);
        $decrypted = $helper->decrypt($encrypted);

        $this->assertSame($descriptor, $decrypted);
    }

    public function test_euclidean_distance_is_zero_for_identical_vectors(): void
    {
        $helper = app(FaceDescriptorHelper::class);
        $descriptor = array_fill(0, 128, 0.1);

        $this->assertEqualsWithDelta(0.0, $helper->euclideanDistance($descriptor, $descriptor), 0.000001);
    }

    public function test_register_persists_face_lock(): void
    {
        $user = User::factory()->create();
        $samples = array_fill(0, 3, array_fill(0, 128, 0.5));

        app(FaceRecognitionService::class)->register($user, $samples);

        $user->refresh();

        $this->assertTrue($user->hasFaceRegistered());
    }

    public function test_face_login_matches_registered_user(): void
    {
        $user = User::factory()->create();
        $descriptor = array_fill(0, 128, 0.25);
        $samples = array_fill(0, 3, $descriptor);

        app(FaceRecognitionService::class)->register($user, $samples);

        $this->get(route('face.login'));
        $action = session('face_liveness_action');

        $response = $this->postJson(route('face.login.store'), [
            'descriptor' => $descriptor,
            'liveness_action' => $action,
            'liveness_passed' => true,
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_face_login_returns_message_when_no_faces_registered(): void
    {
        $this->get(route('face.login'));
        $action = session('face_liveness_action');

        $response = $this->postJson(route('face.login.store'), [
            'descriptor' => array_fill(0, 128, 0.1),
            'liveness_action' => $action,
            'liveness_passed' => true,
        ]);

        $response
            ->assertUnauthorized()
            ->assertJson([
                'success' => false,
                'message' => "You haven't registered Face Lock yet.",
            ]);
    }

    public function test_authenticated_user_can_register_and_delete_face_lock(): void
    {
        $user = User::factory()->create();
        $samples = array_fill(0, 3, array_fill(0, 128, 0.33));

        $this->actingAs($user)
            ->postJson(route('face.register'), ['samples' => $samples])
            ->assertOk()
            ->assertJson(['success' => true]);

        $user->refresh();
        $this->assertTrue($user->hasFaceRegistered());

        $this->actingAs($user)
            ->deleteJson(route('face.delete'))
            ->assertOk()
            ->assertJson(['success' => true]);

        $user->refresh();
        $this->assertFalse($user->hasFaceRegistered());
    }
}
