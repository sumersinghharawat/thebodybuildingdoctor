<?php

namespace App\Services;

use App\Mail\SupportTicketReceivedMail;
use App\Mail\SupportTicketReplyMail;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SupportTicketNotificationService
{
    public static function notifyAdmins(SupportTicket $ticket): void
    {
        $recipients = InquiryNotificationService::adminRecipients();

        if ($recipients === []) {
            Log::warning('Support ticket stored but no admin notification email is configured.', [
                'ticket_id' => $ticket->id,
            ]);

            return;
        }

        Mail::to($recipients)->queue(new SupportTicketReceivedMail($ticket));
    }

    public static function notifyUser(SupportTicket $ticket, SupportTicketReply $reply): void
    {
        Mail::to($ticket->email)->queue(new SupportTicketReplyMail($ticket, $reply));
    }
}
