<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Support\LandingAppSection;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
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
