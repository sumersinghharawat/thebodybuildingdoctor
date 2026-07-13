<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_api_accepts_web_session_for_local_custom_host(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this
            ->withServerVariables([
                'HTTP_HOST' => 'thebodybuildingdoctor.test',
                'HTTPS' => 'on',
                'SERVER_PORT' => 443,
            ])
            ->actingAs($admin)
            ->getJson('https://thebodybuildingdoctor.test/api/admin/users');

        $response->assertOk();
        $response->assertJsonPath('users.0.uid', $admin->id);
    }
}
