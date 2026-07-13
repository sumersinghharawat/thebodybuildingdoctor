<?php

namespace App\Services\FaceAuth;

use App\Models\User;
use Illuminate\Support\Facades\URL;

/**
 * Admins can share a deep-link to the profile Face Lock section.
 * Self-enrollment happens on Profile → Face Lock (authenticated).
 */
class FaceEnrollmentLinkService
{
    public function generate(User $user, int $hours = 24): array
    {
        $hours = max(1, min(168, $hours));
        $expiresAt = now()->addHours($hours);

        // Members enroll themselves after signing in; profile is the Face Lock settings page.
        $url = URL::route('profile.edit', absolute: true).'#face-lock';

        return [
            'url' => $url,
            'expiresAt' => $expiresAt->toISOString(),
            'hours' => $hours,
            'note' => 'User must sign in (or complete first-time setup), then register Face Lock on Profile.',
        ];
    }
}
