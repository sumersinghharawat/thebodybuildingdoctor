<?php

namespace App\Support;

use App\Models\SiteSetting;

class GeneralSettings
{
    public const SETTING_KEY = 'general_settings';

    /**
     * @return array<string, string>
     */
    public static function supportedCurrencies(): array
    {
        return ['INR' => 'Indian Rupee (₹)'];
    }

    public static function defaultCurrency(): string
    {
        return 'INR';
    }

    public static function currency(): string
    {
        return 'INR';
    }

    public static function notificationEmail(): ?string
    {
        $email = trim((string) (self::get()['notificationEmail'] ?? ''));

        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    public static function paymentQrUrl(): string
    {
        return (string) (self::get()['paymentQrUrl'] ?? '');
    }

    public static function paymentInstructions(): string
    {
        return (string) (self::get()['paymentInstructions'] ?? '');
    }

    /**
     * @return array{currency: string, notificationEmail: string, paymentQrUrl: string, paymentInstructions: string}
     */
    public static function get(): array
    {
        $notificationEmail = '';
        $paymentQrUrl = '';
        $paymentInstructions = '';
        $raw = SiteSetting::query()->find(self::SETTING_KEY)?->value;

        if ($raw) {
            $stored = json_decode($raw, true);
            if (is_array($stored)) {
                if (isset($stored['notificationEmail'])) {
                    $notificationEmail = trim((string) $stored['notificationEmail']);
                }
                if (isset($stored['paymentQrUrl'])) {
                    $paymentQrUrl = trim((string) $stored['paymentQrUrl']);
                }
                if (isset($stored['paymentInstructions'])) {
                    $paymentInstructions = trim((string) $stored['paymentInstructions']);
                }
            }
        }

        return [
            'currency' => 'INR',
            'notificationEmail' => $notificationEmail,
            'paymentQrUrl' => MediaUrl::resolve($paymentQrUrl) ?? '',
            'paymentInstructions' => $paymentInstructions,
        ];
    }

    /**
     * @return array{currency: string, notificationEmail: string, paymentQrUrl: string, paymentInstructions: string, supportedCurrencies: array<string, string>}
     */
    public static function forAdmin(): array
    {
        return [
            ...self::get(),
            'supportedCurrencies' => self::supportedCurrencies(),
        ];
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array{currency: string, notificationEmail: string, paymentQrUrl: string, paymentInstructions: string, supportedCurrencies: array<string, string>}
     */
    public static function save(array $input): array
    {
        $notificationEmail = trim((string) ($input['notificationEmail'] ?? ''));
        if ($notificationEmail !== '' && ! filter_var($notificationEmail, FILTER_VALIDATE_EMAIL)) {
            $notificationEmail = '';
        }

        $settings = [
            'currency' => 'INR',
            'notificationEmail' => $notificationEmail,
            'paymentQrUrl' => MediaUrl::storagePath((string) ($input['paymentQrUrl'] ?? '')) ?: trim((string) ($input['paymentQrUrl'] ?? '')),
            'paymentInstructions' => trim((string) ($input['paymentInstructions'] ?? '')),
        ];

        SiteSetting::query()->updateOrCreate(
            ['key' => self::SETTING_KEY],
            ['value' => json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
        );

        return self::forAdmin();
    }

    public static function normalizeCurrency(string $currency): string
    {
        return 'INR';
    }
}
