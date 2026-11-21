<?php

namespace App\Rules;

use App\Services\RecaptchaService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Recaptcha implements ValidationRule
{
    public function __construct(private string $action = 'inquiry') {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $service = app(RecaptchaService::class);

        if (! $service->isEnabled()) {
            return;
        }

        if (! $service->verify(is_string($value) ? $value : null, $this->action)) {
            $fail('reCAPTCHA verification failed. Please try again.');
        }
    }
}
