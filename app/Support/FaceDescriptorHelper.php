<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Crypt;
use InvalidArgumentException;
use RuntimeException;

/**
 * Encrypt, decrypt, and compare face-api.js 128-dim descriptors.
 */
final class FaceDescriptorHelper
{
    /**
     * @param  array<int, float|int>  $descriptor
     */
    public function encrypt(array $descriptor): string
    {
        $normalized = $this->normalize($descriptor);

        return Crypt::encryptString(json_encode($normalized, JSON_THROW_ON_ERROR));
    }

    /**
     * @return array<int, float>
     */
    public function decrypt(string $encrypted): array
    {
        try {
            $json = Crypt::decryptString($encrypted);
        } catch (DecryptException $exception) {
            throw new RuntimeException('Unable to decrypt face descriptor.', 0, $exception);
        }

        $decoded = json_decode($json, true, flags: JSON_THROW_ON_ERROR);

        if (! is_array($decoded)) {
            throw new RuntimeException('Stored face descriptor is invalid.');
        }

        return $this->normalize($decoded);
    }

    /**
     * @param  array<int, array<int, float|int>>  $descriptors
     * @return array<int, float>
     */
    public function average(array $descriptors): array
    {
        if ($descriptors === []) {
            throw new InvalidArgumentException('At least one descriptor sample is required.');
        }

        $length = count($this->normalize($descriptors[0]));
        $sums = array_fill(0, $length, 0.0);

        foreach ($descriptors as $descriptor) {
            $normalized = $this->normalize($descriptor);

            for ($index = 0; $index < $length; $index++) {
                $sums[$index] += $normalized[$index];
            }
        }

        $count = count($descriptors);

        return array_map(static fn (float $value): float => $value / $count, $sums);
    }

    /**
     * Euclidean distance between two descriptors (lower = closer match).
     *
     * @param  array<int, float|int>  $left
     * @param  array<int, float|int>  $right
     */
    public function euclideanDistance(array $left, array $right): float
    {
        $left = $this->normalize($left);
        $right = $this->normalize($right);

        $sum = 0.0;

        foreach ($left as $index => $value) {
            $delta = $value - $right[$index];
            $sum += $delta * $delta;
        }

        return sqrt($sum);
    }

    /**
     * @param  array<int, mixed>  $descriptor
     * @return array<int, float>
     */
    public function normalize(array $descriptor): array
    {
        $expectedLength = (int) config('faceauth.descriptor_length', 128);

        if (count($descriptor) !== $expectedLength) {
            throw new InvalidArgumentException("Face descriptor must contain {$expectedLength} values.");
        }

        return array_map(static function (mixed $value): float {
            if (! is_int($value) && ! is_float($value) && ! is_string($value)) {
                throw new InvalidArgumentException('Descriptor values must be numeric.');
            }

            return (float) $value;
        }, array_values($descriptor));
    }
}
