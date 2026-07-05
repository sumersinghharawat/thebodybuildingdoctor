<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\GeneralSettings;
use App\Support\LandingAppSection;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SiteSettingsController extends Controller
{
    public function showGeneral()
    {
        return response()->json([
            'settings' => GeneralSettings::forAdmin(),
        ]);
    }

    public function updateGeneral(Request $request)
    {
        $data = $request->validate([
            'currency' => ['required', 'string', Rule::in(array_keys(GeneralSettings::supportedCurrencies()))],
            'notificationEmail' => ['nullable', 'email', 'max:190'],
        ]);

        return response()->json([
            'settings' => GeneralSettings::save($data),
        ]);
    }

    public function showLandingApp()
    {
        return response()->json([
            'appSection' => LandingAppSection::get(),
        ]);
    }

    public function updateLandingApp(Request $request)
    {
        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'eyebrow' => ['required', 'string', 'max:120'],
            'title' => ['required', 'string', 'max:190'],
            'description' => ['required', 'string', 'max:2000'],
            'features' => ['required', 'array', 'min:1', 'max:8'],
            'features.*' => ['required', 'string', 'max:190'],
            'playStoreUrl' => ['nullable', 'string', 'max:500'],
            'appDownloadUrl' => ['nullable', 'string', 'max:500'],
            'buttonLabel' => ['required', 'string', 'max:120'],
            'comingSoonLabel' => ['required', 'string', 'max:120'],
            'screenshotUrl' => ['nullable', 'string', 'max:500'],
            'mockupLabel' => ['nullable', 'string', 'max:120'],
        ]);

        return response()->json([
            'appSection' => LandingAppSection::save($data),
        ]);
    }
}
