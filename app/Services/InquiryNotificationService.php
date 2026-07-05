<?php

namespace App\Services;

use App\Mail\InquiryReceivedMail;
use App\Models\Inquiry;
use App\Models\User;
use App\Support\GeneralSettings;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class InquiryNotificationService
{
    /**
     * @return list<string>
     */
    public static function adminRecipients(): array
    {
        $configured = GeneralSettings::notificationEmail();
        if ($configured !== null) {
            return [$configured];
        }

        $fromEnv = config('mail.admin_notification');
        if (is_string($fromEnv) && trim($fromEnv) !== '') {
            return array_values(array_filter(array_map('trim', explode(',', $fromEnv))));
        }

        return User::query()
            ->get()
            ->filter(fn (User $user) => $user->isAdmin())
            ->pluck('email')
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public static function notifyAdmins(Inquiry $inquiry): void
    {
        $recipients = self::adminRecipients();

        if ($recipients === []) {
            Log::warning('Course access inquiry stored but no admin notification email is configured.', [
                'inquiry_id' => $inquiry->id,
            ]);

            return;
        }

        Mail::to($recipients)->send(new InquiryReceivedMail($inquiry));
    }
}
