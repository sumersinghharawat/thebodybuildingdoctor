<?php

namespace App\Services\FaceAuth;

use App\Models\FaceAuthAttempt;
use App\Models\User;
use App\Support\FaceDescriptorHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class FaceRecognitionService
{
    public function __construct(
        private readonly FaceDescriptorHelper $descriptors,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function clientConfig(): array
    {
        return [
            'modelsPath' => config('faceauth.models_path', '/models'),
            'descriptorLength' => (int) config('faceauth.descriptor_length', 128),
            'matchThreshold' => (float) config('faceauth.match_threshold', 0.45),
            'enrollmentSamples' => (int) config('faceauth.enrollment_samples', 3),
            'livenessActions' => config('faceauth.liveness_actions', ['front', 'left', 'right']),
            'enrollmentPoses' => config('faceauth.enrollment_poses', ['front', 'left', 'right']),
        ];
    }

    public function randomLivenessAction(): string
    {
        $actions = config('faceauth.liveness_actions', ['front', 'left', 'right']);

        return $actions[array_rand($actions)];
    }

    /**
     * @param  array<int, float|int>  $descriptor
     * @return array{user: User, distance: float}|null
     */
    public function findBestMatch(array $descriptor): ?array
    {
        $probe = $this->descriptors->normalize($descriptor);
        $threshold = (float) config('faceauth.match_threshold', 0.45);

        $bestUser = null;
        $bestDistance = null;

        /** @var Collection<int, User> $users */
        $users = User::query()
            ->whereNotNull('face_descriptor')
            ->whereNotNull('face_registered_at')
            ->get();

        foreach ($users as $user) {
            try {
                $stored = $this->descriptors->decrypt((string) $user->face_descriptor);
                $distance = $this->descriptors->euclideanDistance($probe, $stored);
            } catch (\Throwable) {
                continue;
            }

            if ($bestDistance === null || $distance < $bestDistance) {
                $bestDistance = $distance;
                $bestUser = $user;
            }
        }

        if ($bestUser === null || $bestDistance === null || $bestDistance > $threshold) {
            return null;
        }

        return [
            'user' => $bestUser,
            'distance' => $bestDistance,
        ];
    }

    /**
     * @param  array<int, float|int>|array<int, array<int, float|int>>  $descriptorOrSamples
     */
    public function register(User $user, array $descriptorOrSamples): User
    {
        $samples = $this->normalizeSamples($descriptorOrSamples);
        $averaged = $this->descriptors->average($samples);
        $encrypted = $this->descriptors->encrypt($averaged);

        return DB::transaction(function () use ($user, $encrypted): User {
            $user->forceFill([
                'face_descriptor' => $encrypted,
                'face_registered_at' => now(),
            ])->save();

            return $user->refresh();
        });
    }

    public function delete(User $user): User
    {
        return DB::transaction(function () use ($user): User {
            $user->forceFill([
                'face_descriptor' => null,
                'face_registered_at' => null,
            ])->save();

            return $user->refresh();
        });
    }

    public function isRegistered(?User $user): bool
    {
        return $user instanceof User && $user->hasFaceRegistered();
    }

    /**
     * @param  array<int, float|int>|array<int, array<int, float|int>>  $input
     * @return array<int, array<int, float>>
     */
    public function normalizeSamples(array $input): array
    {
        if ($input === []) {
            throw new InvalidArgumentException('Face descriptor samples are required.');
        }

        // Single descriptor vector.
        if (! is_array($input[0] ?? null)) {
            return [$this->descriptors->normalize($input)];
        }

        $expected = (int) config('faceauth.enrollment_samples', 3);

        if (count($input) !== $expected) {
            throw new InvalidArgumentException("Exactly {$expected} face samples are required.");
        }

        return array_map(
            fn (array $sample): array => $this->descriptors->normalize($sample),
            $input,
        );
    }

    public function logAttempt(
        Request $request,
        string $type,
        string $status,
        ?User $user = null,
        ?string $reason = null,
        ?float $distance = null,
    ): FaceAuthAttempt {
        return FaceAuthAttempt::query()->create([
            'user_id' => $user?->id,
            'type' => $type,
            'status' => $status,
            'reason' => $reason,
            'match_distance' => $distance,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);
    }
}
