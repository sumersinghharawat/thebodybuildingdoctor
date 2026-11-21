<?php

namespace App\Services;

use App\Models\User;
use App\Models\VaultPurchase;
use App\Models\VaultVideo;
use App\Support\Roles;

class VaultAccessService
{
    public function canWatchFull(?User $user, VaultVideo $video): bool
    {
        if ($video->isFree()) {
            return true;
        }

        if (! $user) {
            return false;
        }

        if (Roles::isAdmin($user->roleList())) {
            return true;
        }

        return VaultPurchase::query()
            ->where('user_id', $user->id)
            ->where('vault_video_id', $video->id)
            ->where('status', 'active')
            ->exists();
    }

    public function accessStatus(?User $user, string $videoId): ?string
    {
        if (! $user) {
            return null;
        }

        if (Roles::isAdmin($user->roleList())) {
            return 'active';
        }

        return VaultPurchase::query()
            ->where('user_id', $user->id)
            ->where('vault_video_id', $videoId)
            ->value('status');
    }
}
