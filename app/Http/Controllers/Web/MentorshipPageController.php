<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Inertia\Inertia;

class MentorshipPageController extends Controller
{
    public function show(string $slug)
    {
        $mentorship = Blog::query()
            ->where('published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Mentorship/Show', [
            'mentorship' => $mentorship->toPublicArray(),
        ]);
    }
}
