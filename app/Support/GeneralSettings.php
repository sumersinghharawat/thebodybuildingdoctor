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
        return config('currencies.supported', ['EUR' => 'Euro (€)']);
    }

    public static function defaultCurrency(): string
    {
        return (string) config('currencies.default', 'EUR');
    }

    public static function currency(): string
    {
        return self::get()['currency'];
    }

    public static function notificationEmail(): ?string
    {
        $email = trim((string) (self::get()['notificationEmail'] ?? ''));

        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }

    /**
     * @return array{currency: string, notificationEmail: string}
     */
    public static function get(): array
    {
        $currency = self::defaultCurrency();
        $notificationEmail = '';
        $raw = SiteSetting::query()->find(self::SETTING_KEY)?->value;

        if ($raw) {
            $stored = json_decode($raw, true);
            if (is_array($stored)) {
                if (isset($stored['currency'])) {
                    $currency = (string) $stored['currency'];
                }
                if (isset($stored['notificationEmail'])) {
                    $notificationEmail = trim((string) $stored['notificationEmail']);
                }
            }
        }

        return [
            'currency' => self::normalizeCurrency($currency),
            'notificationEmail' => $notificationEmail,
        ];
    }

    /**
     * @return array{currency: string, notificationEmail: string, supportedCurrencies: array<string, string>}
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
     * @return array{currency: string, notificationEmail: string, supportedCurrencies: array<string, string>}
     */
    public static function save(array $input): array
    {
        $notificationEmail = trim((string) ($input['notificationEmail'] ?? ''));
        if ($notificationEmail !== '' && ! filter_var($notificationEmail, FILTER_VALIDATE_EMAIL)) {
            $notificationEmail = '';
        }

        $settings = [
            'currency' => self::normalizeCurrency((string) ($input['currency'] ?? self::defaultCurrency())),
            'notificationEmail' => $notificationEmail,
        ];

        SiteSetting::query()->updateOrCreate(
            ['key' => self::SETTING_KEY],
            ['value' => json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
        );

        return self::forAdmin();
    }

    public static function normalizeCurrency(string $currency): string
    {
        $currency = strtoupper(trim($currency));
        $supported = self::supportedCurrencies();

        if (! array_key_exists($currency, $supported)) {
            return self::defaultCurrency();
        }

        return $currency;
    }
}
