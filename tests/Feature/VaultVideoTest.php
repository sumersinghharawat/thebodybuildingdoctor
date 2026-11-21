<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VaultPurchase;
use App\Models\VaultVideo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VaultVideoTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_lists_published_vault_videos(): void
    {
        $this->makeVideo('peak-week', 'Peak Week', published: true);
        $this->makeVideo('draft-lab', 'Draft Lab', published: false);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Landing')
                ->has('vaultVideos', 1)
                ->where('vaultVideos.0.id', 'peak-week')
                ->where('vaultVideos.0.priceCents', 9900)
                ->where('vaultVideos.0.previewSeconds', 30)
                ->where('vaultVideos.0.videoUrl', '')
                ->where('totalVaultCount', 1));
    }

    public function test_guest_can_open_a_preview_but_not_full_access(): void
    {
        $video = $this->makeVideo('shoulder-lab', 'Shoulder Lab');

        $this->get(route('vault.show', $video->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Vault/Show')
                ->where('authenticated', false)
                ->where('canPurchase', false)
                ->where('video.hasAccess', false)
                ->where('video.previewSeconds', 30)
                ->where('video.videoUrl', 'https://www.youtube.com/watch?v=abcdefghijk'));

        $this->get(route('vault.purchase', $video->id))
            ->assertRedirect(route('login'));

        $this->post(route('vault.request', $video->id))
            ->assertRedirect(route('login'));
    }

    public function test_member_payment_stays_locked_until_admin_allocates_access(): void
    {
        $member = User::factory()->create();
        $video = $this->makeVideo('peak-week', 'Peak Week');

        $this->actingAs($member)
            ->post(route('vault.request', $video->id))
            ->assertRedirect();

        $this->assertDatabaseHas('vault_purchases', [
            'user_id' => $member->id,
            'vault_video_id' => $video->id,
            'status' => 'pending',
            'source' => 'purchase',
        ]);

        $this->actingAs($member)
            ->get(route('vault.show', $video->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('video.hasAccess', false)
                ->where('video.accessStatus', 'pending')
                ->where('canPurchase', true));

        VaultPurchase::query()
            ->where('user_id', $member->id)
            ->where('vault_video_id', $video->id)
            ->update([
                'status' => 'active',
                'granted_at' => now(),
            ]);

        $this->actingAs($member)
            ->get(route('vault.show', $video->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('video.hasAccess', true)
                ->where('video.accessStatus', 'active'));
    }

    public function test_subscriber_library_only_includes_allocated_videos(): void
    {
        $subscriber = User::factory()->subscriber()->create();
        $granted = $this->makeVideo('granted-video', 'Granted Video');
        $hidden = $this->makeVideo('hidden-video', 'Hidden Video');

        VaultPurchase::query()->create([
            'user_id' => $subscriber->id,
            'vault_video_id' => $granted->id,
            'status' => 'active',
            'source' => 'admin',
            'granted_at' => now(),
        ]);

        $this->actingAs($subscriber)
            ->get(route('vault.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Vault/Index')
                ->has('videos', 1)
                ->where('videos.0.id', $granted->id));

        $this->actingAs($subscriber)
            ->get(route('vault.show', $hidden->id))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('video.hasAccess', false));

        $this->actingAs($subscriber)
            ->post(route('vault.request', $hidden->id))
            ->assertForbidden();
    }

    public function test_admin_can_manage_videos_and_allocate_access(): void
    {
        $admin = User::factory()->create([
            'roles' => ['administrator'],
        ]);
        $member = User::factory()->create();

        $created = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/vault-videos', [
                'title' => 'Bloodwork Review',
                'description' => 'How to read a prep panel.',
                'videoUrl' => 'https://vimeo.com/123456789',
                'priceCents' => 14900,
                'previewSeconds' => 30,
                'published' => true,
            ])
            ->assertCreated()
            ->json('video');

        $this->assertNotEmpty($created['id']);
        $this->assertSame(14900, $created['priceCents']);

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/vault-purchases', [
                'uid' => $member->id,
                'videoId' => $created['id'],
                'status' => 'active',
                'source' => 'admin',
            ])
            ->assertCreated()
            ->assertJsonPath('purchase.status', 'active');

        $this->actingAs($member)
            ->get(route('vault.show', $created['id']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('video.hasAccess', true));

        $this->actingAs($admin)
            ->get(route('admin.vault.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Vault/Index'));

        $this->actingAs($admin)
            ->get(route('admin.vault-access.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/VaultAccess/Index'));
    }

    private function makeVideo(string $id, string $title, bool $published = true): VaultVideo
    {
        return VaultVideo::query()->create([
            'id' => $id,
            'title' => $title,
            'slug' => $id,
            'description' => 'Description',
            'video_url' => 'https://www.youtube.com/watch?v=abcdefghijk',
            'price_cents' => 9900,
            'preview_seconds' => 30,
            'published' => $published,
            'sort_order' => 1,
        ]);
    }
}
