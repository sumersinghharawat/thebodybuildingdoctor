<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Inertia\Inertia;

class BlogPageController extends Controller
{
    public function show(string $slug)
    {
        $blog = Blog::query()
            ->where('published', true)
            ->where('slug', $slug)
            ->firstOrFail();

        return Inertia::render('Blog/Show', [
            'blog' => $blog->toPublicArray(),
        ]);
    }
}
