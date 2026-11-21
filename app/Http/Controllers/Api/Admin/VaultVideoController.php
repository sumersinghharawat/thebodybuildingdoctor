<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VaultVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VaultVideoController extends Controller
{
    public function index()
    {
        return response()->json([
            'videos' => VaultVideo::query()->orderBy('sort_order')->orderBy('title')->get()->map->toAdminArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $video = VaultVideo::query()->create([
            'id' => Str::random(24),
            ...$data,
        ]);

        return response()->json(['video' => $video->toAdminArray()], 201);
    }

    public function show(string $id)
    {
        $video = VaultVideo::query()->findOrFail($id);

        return response()->json(['video' => $video->toAdminArray()]);
    }

    public function update(Request $request, string $id)
    {
        $video = VaultVideo::query()->findOrFail($id);
        $video->update($this->validated($request, partial: true));

        return response()->json(['video' => $video->fresh()->toAdminArray()]);
    }

    public function destroy(string $id)
    {
        VaultVideo::query()->findOrFail($id)->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $data = $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190'],
            'description' => [$partial ? 'sometimes' : 'required', 'string'],
            'descriptionHtml' => ['nullable', 'string'],
            'thumbnailUrl' => ['nullable', 'string'],
            'videoUrl' => ['nullable', 'string', 'max:500'],
            'published' => ['nullable', 'boolean'],
            'priceCents' => ['nullable', 'integer', 'min:0'],
            'previewSeconds' => ['nullable', 'integer', 'min:5', 'max:600'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $slug = trim((string) ($data['slug'] ?? ''));
        if ($slug === '' && isset($data['title'])) {
            $slug = Str::slug($data['title']);
        }

        $mapped = [
            'title' => $data['title'] ?? null,
            'slug' => $slug !== '' ? $slug : null,
            'description' => $data['description'] ?? null,
            'description_html' => $data['descriptionHtml'] ?? null,
            'thumbnail_url' => $data['thumbnailUrl'] ?? null,
            'video_url' => $data['videoUrl'] ?? null,
            'published' => $data['published'] ?? null,
            'price_cents' => $data['priceCents'] ?? null,
            'preview_seconds' => $data['previewSeconds'] ?? null,
            'sort_order' => $data['order'] ?? null,
        ];

        if ($partial) {
            return array_filter($mapped, fn ($value) => $value !== null);
        }

        return [
            'title' => $mapped['title'],
            'slug' => $mapped['slug'] ?? Str::slug($mapped['title']),
            'description' => $mapped['description'],
            'description_html' => $mapped['description_html'],
            'thumbnail_url' => $mapped['thumbnail_url'] ?? '',
            'video_url' => $mapped['video_url'] ?? '',
            'published' => $mapped['published'] ?? false,
            'price_cents' => $mapped['price_cents'] ?? 0,
            'preview_seconds' => $mapped['preview_seconds'] ?? 30,
            'sort_order' => $mapped['sort_order'] ?? 0,
        ];
    }
}
