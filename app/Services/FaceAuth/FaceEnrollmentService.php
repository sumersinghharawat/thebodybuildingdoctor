<?php

namespace App\Services\FaceAuth;

use App\Models\User;

/**
 * @deprecated Use FaceRecognitionService — kept for admin panel compatibility.
 */
class FaceEnrollmentService
{
    public function __construct(
        private readonly FaceRecognitionService $faces,
    ) {}

    /**
     * @param  array<int, array<int, float|int>>  $samples
     */
    public function enroll(User $user, array $samples): User
    {
        return $this->faces->register($user, $samples);
    }

    public function isEnrolled(?User $user): bool
    {
        return $this->faces->isRegistered($user);
    }

    public function revoke(User $user): User
    {
        return $this->faces->delete($user);
    }
}
