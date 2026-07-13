<?php

namespace App\Services\FaceAuth;

use App\Models\User;
use App\Support\FaceDescriptorHelper;

/**
 * @deprecated Use FaceRecognitionService::findBestMatch() — kept for admin panel compatibility.
 */
class FaceMatchingService
{
    public function __construct(
        private readonly FaceRecognitionService $faces,
        private readonly FaceDescriptorHelper $descriptors,
    ) {}

    /**
     * @param  array<int, float|int>  $descriptor
     * @return array{user: User, similarity: float}|null
     */
    public function findBestMatch(array $descriptor): ?array
    {
        $match = $this->faces->findBestMatch($descriptor);

        if ($match === null) {
            return null;
        }

        return [
            'user' => $match['user'],
            'similarity' => $match['distance'],
        ];
    }

    public function logAttempt(
        $request,
        string $type,
        string $status,
        ?User $user = null,
        ?string $reason = null,
        ?float $similarity = null,
    ) {
        return $this->faces->logAttempt($request, $type, $status, $user, $reason, $similarity);
    }
}
