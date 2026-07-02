<?php

namespace App\Support;

use App\Models\SiteSetting;

class LandingAppSection
{
    public const SETTING_KEY = 'landing_app_section';

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'enabled' => true,
            'eyebrow' => 'Mobile app',
            'title' => 'Take your training on the go',
            'description' => 'Access courses, mentorship content, and member updates from our Android app — built for athletes who want coaching and education wherever they train.',
            'features' => [
                'Stream course lessons on your phone',
                'Stay up to date with new mentorship content',
                'One account across web and mobile',
            ],
            'playStoreUrl' => '',
            'buttonLabel' => 'Get it on Google Play',
            'comingSoonLabel' => 'Coming soon to Google Play',
            'screenshotUrl' => '',
            'mockupLabel' => 'The Bodybuilding Doctor',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function get(): array
    {
        $settings = self::defaults();
        $raw = SiteSetting::query()->find(self::SETTING_KEY)?->value;

        if ($raw) {
            $stored = json_decode($raw, true);
            if (is_array($stored)) {
                $settings = array_merge($settings, $stored);
            }
        }

        if (empty($settings['playStoreUrl'])) {
            $settings['playStoreUrl'] = (string) config('marketing.android_play_store_url', '');
        }

        $settings['enabled'] = (bool) ($settings['enabled'] ?? true);
        $settings['features'] = array_values(array_filter(
            array_map('strval', $settings['features'] ?? []),
            fn (string $feature) => trim($feature) !== '',
        ));

        if ($settings['features'] === []) {
            $settings['features'] = self::defaults()['features'];
        }

        return self::toPublicArray($settings);
    }

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function save(array $input): array
    {
        $settings = array_merge(self::defaults(), $input);
        $settings['enabled'] = (bool) ($settings['enabled'] ?? false);
        $settings['features'] = array_values(array_filter(
            array_map(fn ($feature) => trim((string) $feature), $settings['features'] ?? []),
            fn (string $feature) => $feature !== '',
        ));

        SiteSetting::query()->updateOrCreate(
            ['key' => self::SETTING_KEY],
            ['value' => json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)],
        );

        return self::get();
    }

    /**
     * @param  array<string, mixed>  $settings
     * @return array<string, mixed>
     */
    public static function toPublicArray(array $settings): array
    {
        return [
            'enabled' => (bool) ($settings['enabled'] ?? true),
            'eyebrow' => (string) ($settings['eyebrow'] ?? ''),
            'title' => (string) ($settings['title'] ?? ''),
            'description' => (string) ($settings['description'] ?? ''),
            'features' => $settings['features'] ?? [],
            'playStoreUrl' => (string) ($settings['playStoreUrl'] ?? ''),
            'buttonLabel' => (string) ($settings['buttonLabel'] ?? 'Get it on Google Play'),
            'comingSoonLabel' => (string) ($settings['comingSoonLabel'] ?? 'Coming soon to Google Play'),
            'screenshotUrl' => (string) ($settings['screenshotUrl'] ?? ''),
            'mockupLabel' => (string) ($settings['mockupLabel'] ?? ''),
        ];
    }
}
