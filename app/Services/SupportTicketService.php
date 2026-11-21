<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketReply;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SupportTicketService
{
    public const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    public const VIDEO_MIMES = ['video/mp4', 'video/webm', 'video/quicktime'];

    public const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    public const VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $files
     */
    public static function create(array $data, array $files = [], ?User $user = null): SupportTicket
    {
        $ticket = SupportTicket::query()->create([
            'id' => Str::random(24),
            'user_id' => $user?->id,
            'name' => $data['name'],
            'email' => $data['email'],
            'subject' => $data['subject'],
            'message' => $data['message'],
            'status' => 'open',
        ]);

        foreach ($files as $file) {
            self::storeAttachment($ticket, $file);
        }

        $ticket->load('attachments');
        SupportTicketNotificationService::notifyAdmins($ticket);

        return $ticket;
    }

    public static function reply(SupportTicket $ticket, string $body, User $admin): SupportTicketReply
    {
        $reply = SupportTicketReply::query()->create([
            'id' => Str::random(24),
            'support_ticket_id' => $ticket->id,
            'user_id' => $admin->id,
            'body' => $body,
            'is_admin' => true,
        ]);

        if ($ticket->status === 'open') {
            $ticket->status = 'in_progress';
            $ticket->save();
        }

        $reply->setRelation('user', $admin);
        SupportTicketNotificationService::notifyUser($ticket, $reply);

        return $reply;
    }

    public static function setStatus(SupportTicket $ticket, string $status): SupportTicket
    {
        $ticket->status = $status;
        $ticket->resolved_at = $status === 'resolved' ? now() : null;
        $ticket->save();

        return $ticket;
    }

    public static function kindFor(UploadedFile $file): string
    {
        $mime = strtolower((string) $file->getMimeType());
        $extension = strtolower((string) $file->getClientOriginalExtension());

        if (in_array($mime, self::IMAGE_MIMES, true) || in_array($extension, self::IMAGE_EXTENSIONS, true)) {
            return 'image';
        }

        if (in_array($mime, self::VIDEO_MIMES, true) || in_array($extension, self::VIDEO_EXTENSIONS, true)) {
            return 'video';
        }

        throw ValidationException::withMessages([
            'attachments' => 'Please upload a screenshot (JPG, PNG, WebP, GIF) or a video (MP4, WebM, MOV).',
        ]);
    }

    private static function storeAttachment(SupportTicket $ticket, UploadedFile $file): SupportTicketAttachment
    {
        $kind = self::kindFor($file);
        $maxKilobytes = $kind === 'video' ? 51200 : 8192;

        if ($file->getSize() > $maxKilobytes * 1024) {
            throw ValidationException::withMessages([
                'attachments' => $kind === 'video'
                    ? 'Videos must be 50MB or smaller.'
                    : 'Screenshots must be 8MB or smaller.',
            ]);
        }

        $path = $file->store("support/{$ticket->id}", 'public');

        return SupportTicketAttachment::query()->create([
            'id' => Str::random(24),
            'support_ticket_id' => $ticket->id,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => (string) $file->getMimeType(),
            'kind' => $kind,
            'size_bytes' => (int) $file->getSize(),
        ]);
    }
}
