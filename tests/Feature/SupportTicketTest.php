<?php

namespace Tests\Feature;

use App\Mail\SupportTicketReceivedMail;
use App\Mail\SupportTicketReplyMail;
use App\Models\SiteSetting;
use App\Models\SupportTicket;
use App\Models\User;
use App\Support\GeneralSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SupportTicketTest extends TestCase
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

    public function test_support_page_is_available(): void
    {
        $this->get(route('support.create'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Support/Create'));
    }

    public function test_guest_can_submit_a_ticket_with_screenshot_and_admin_is_emailed(): void
    {
        Mail::fake();
        Storage::fake('public');

        $screenshot = UploadedFile::fake()->image('issue.png', 40, 40);

        $response = $this->post(route('support.store'), [
            'name' => 'Alex Member',
            'email' => 'alex@example.com',
            'subject' => 'Video will not play',
            'message' => 'The lesson player stays blank on Safari.',
            'attachments' => [$screenshot],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('support_tickets', [
            'email' => 'alex@example.com',
            'subject' => 'Video will not play',
            'status' => 'open',
        ]);
        $this->assertDatabaseCount('support_ticket_attachments', 1);
        Mail::assertQueued(SupportTicketReceivedMail::class);
    }

    public function test_admin_can_reply_and_user_is_emailed(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'roles' => ['administrator'],
        ]);

        $this->post(route('support.store'), [
            'name' => 'Alex Member',
            'email' => 'alex@example.com',
            'subject' => 'Cannot login',
            'message' => 'Password reset never arrives.',
        ])->assertRedirect();

        $ticket = SupportTicket::query()->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.support.reply', $ticket->id), [
                'body' => 'Please check your spam folder, then try again.',
                'status' => 'resolved',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('support_ticket_replies', [
            'support_ticket_id' => $ticket->id,
            'body' => 'Please check your spam folder, then try again.',
        ]);
        $this->assertSame('resolved', $ticket->fresh()->status);
        Mail::assertQueued(SupportTicketReplyMail::class);
    }

    public function test_reply_email_is_stored_in_the_jobs_table(): void
    {
        config(['queue.default' => 'database']);

        $admin = User::factory()->create([
            'roles' => ['administrator'],
        ]);

        $this->post(route('support.store'), [
            'name' => 'Alex Member',
            'email' => 'alex@example.com',
            'subject' => 'Cannot login',
            'message' => 'Password reset never arrives.',
        ])->assertRedirect();

        $this->assertDatabaseCount('jobs', 1);
        $this->assertStringContainsString(
            'SupportTicketReceivedMail',
            (string) \Illuminate\Support\Facades\DB::table('jobs')->value('payload'),
        );

        $ticket = SupportTicket::query()->firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.support.reply', $ticket->id), [
                'body' => 'Please check your spam folder, then try again.',
                'status' => 'resolved',
            ])
            ->assertRedirect();

        $payloads = \Illuminate\Support\Facades\DB::table('jobs')->pluck('payload')->implode(' ');
        $this->assertDatabaseCount('jobs', 2);
        $this->assertStringContainsString('SupportTicketReplyMail', $payloads);

        $this->artisan('queue:work', [
            '--stop-when-empty' => true,
            '--tries' => 1,
        ])->assertSuccessful();

        $this->assertDatabaseCount('jobs', 0);
    }

    public function test_scheduler_lists_the_queue_worker(): void
    {
        config(['queue.default' => 'database']);

        $this->artisan('schedule:list')
            ->expectsOutputToContain('queue:work')
            ->assertSuccessful();
    }

    public function test_member_cannot_open_admin_support_inbox(): void
    {
        $member = User::factory()->create([
            'roles' => ['media_channel'],
        ]);

        $this->actingAs($member)
            ->get(route('admin.support.index'))
            ->assertForbidden();
    }
}
