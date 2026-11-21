<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Services\ContentProtectionService;
use App\Services\PlaybackService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MentorshipPageController extends Controller
{
    public function show(Request $request, string $slug)
    {
        abort_unless($request->user()?->canAccessMentorship(), 403);

        $mentorship = Blog::query()
            ->where('published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Mentorship/Show', [
            'mentorship' => $mentorship->toPublicArray(),
        ]);
    }

    public function playback(Request $request, string $id)
    {
        abort_unless($request->user()?->canAccessMentorship(), 403);

        $mentorship = Blog::query()->where('published', true)->findOrFail($id);
        $playback = PlaybackService::resolve($mentorship->video_url, '');

        if (! $playback) {
            return response()->json(['message' => 'Video unavailable'], 404);
        }

        return response()->json(['playback' => $playback]);
    }

    public function embedPlayback(Request $request, string $id, int $slot)
    {
        abort_unless($request->user()?->canAccessMentorship(), 403);

        $mentorship = Blog::query()->where('published', true)->findOrFail($id);
        $playback = ContentProtectionService::embeddedPlaybackAt($mentorship->content_html, $slot);

        if (! $playback) {
            return response()->json(['message' => 'Video unavailable'], 404);
        }

        return response()->json(['playback' => $playback]);
    }
}
