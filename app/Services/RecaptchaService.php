<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class RecaptchaService
{
    public function isEnabled(): bool
    {
        return filled($this->siteKey()) && filled($this->secretKey());
    }

    public function siteKey(): ?string
    {
        $key = config('services.recaptcha.site_key');

        return filled($key) ? $key : null;
    }

    /**
     * @return array{enabled: bool, siteKey: string|null}
     */
    public function clientConfig(): array
    {
        return [
            'enabled' => $this->isEnabled(),
            'siteKey' => $this->siteKey(),
        ];
    }

    public function verify(?string $token, string $action = 'inquiry'): bool
    {
        if (! $this->isEnabled()) {
            return true;
        }

        if (! filled($token)) {
            return false;
        }

        $response = Http::asForm()
            ->timeout(10)
            ->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $this->secretKey(),
                'response' => $token,
            ]);

        if (! $response->successful()) {
            return false;
        }

        $payload = $response->json();

        if (! ($payload['success'] ?? false)) {
            return false;
        }

        $expectedAction = $action;
        $receivedAction = $payload['action'] ?? null;
        if ($receivedAction !== null && $receivedAction !== $expectedAction) {
            return false;
        }

        $score = $payload['score'] ?? null;
        if ($score !== null && $score < $this->minScore()) {
            return false;
        }

        return true;
    }

    private function secretKey(): ?string
    {
        $key = config('services.recaptcha.secret_key');

        return filled($key) ? $key : null;
    }

    private function minScore(): float
    {
        return (float) config('services.recaptcha.min_score', 0.5);
    }
}
