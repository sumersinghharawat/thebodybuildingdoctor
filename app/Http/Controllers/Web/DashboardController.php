<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Support\Roles;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $user = auth()->user();
        $roles = $user->roleList();

        if (! Roles::canAccessMentorship($roles)) {
            return redirect()->route('learn.index');
        }

        $mentorship = Blog::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->get()
            ->map->toPublicArray();

        return Inertia::render('Dashboard', [
            'mentorship' => $mentorship,
            'isAdmin' => Roles::isAdmin($roles),
            'mediaChannelOnly' => Roles::isMediaChannelOnly($roles),
        ]);
    }
}
