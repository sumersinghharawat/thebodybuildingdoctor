<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index()
    {
        return response()->json([
            'blogs' => Blog::query()->orderBy('sort_order')->orderByDesc('published_at')->get()->map->toPublicArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $blog = Blog::query()->create([
            'id' => Str::random(24),
            'published_at' => ($data['published'] ?? false) ? now() : null,
            ...$data,
        ]);

        return response()->json(['blog' => $blog->toPublicArray()], 201);
    }

    public function show(string $id)
    {
        return response()->json(['blog' => Blog::query()->findOrFail($id)->toPublicArray()]);
    }

    public function update(Request $request, string $id)
    {
        $blog = Blog::query()->findOrFail($id);
        $data = $this->validated($request, partial: true);
        if (array_key_exists('published', $data) && $data['published'] && ! $blog->published_at) {
            $data['published_at'] = now();
        }
        $blog->update($data);

        return response()->json(['blog' => $blog->fresh()->toPublicArray()]);
    }

    public function destroy(string $id)
    {
        Blog::query()->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $data = $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190'],
            'excerpt' => ['nullable', 'string'],
            'contentHtml' => [$partial ? 'sometimes' : 'required', 'string'],
            'thumbnailUrl' => ['nullable', 'string'],
            'authorName' => ['nullable', 'string', 'max:120'],
            'published' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        return [
            'title' => $data['title'] ?? null,
            'slug' => $data['slug'] ?? ($data['title'] ?? null ? Str::slug($data['title']) : null),
            'excerpt' => $data['excerpt'] ?? '',
            'content_html' => $data['contentHtml'] ?? null,
            'thumbnail_url' => $data['thumbnailUrl'] ?? '',
            'author_name' => $data['authorName'] ?? 'The Bodybuilding Doctor',
            'published' => $data['published'] ?? false,
            'sort_order' => $data['order'] ?? 0,
        ];
    }
}
