<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index()
    {
        return response()->json([
            'courses' => Course::query()->orderBy('sort_order')->get()->map->toAdminArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $course = Course::query()->create([
            'id' => Str::random(24),
            ...$data,
        ]);

        return response()->json(['course' => $course->toAdminArray()], 201);
    }

    public function show(string $id)
    {
        $course = Course::query()->findOrFail($id);

        return response()->json([
            'course' => $course->toAdminArray(),
            'lessons' => $course->lessons->map->toAdminArray(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $course = Course::query()->findOrFail($id);
        $course->update($this->validated($request, partial: true));

        return response()->json(['course' => $course->fresh()->toAdminArray()]);
    }

    public function destroy(string $id)
    {
        Course::query()->where('id', $id)->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190'],
            'description' => [$partial ? 'sometimes' : 'required', 'string'],
            'descriptionHtml' => ['nullable', 'string'],
            'thumbnailUrl' => ['nullable', 'string'],
            'pdfUrl' => ['nullable', 'string', 'max:500'],
            'videoUrl' => ['nullable', 'string', 'max:500'],
            'instructorName' => ['nullable', 'string', 'max:120'],
            'level' => ['nullable', 'in:beginner,intermediate,advanced'],
            'category' => ['nullable', 'string', 'max:120'],
            'published' => ['nullable', 'boolean'],
            'priceCents' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];

        $data = $request->validate($rules);

        $mapped = [
            'title' => $data['title'] ?? null,
            'slug' => $data['slug'] ?? (isset($data['title']) ? Str::slug($data['title']) : null),
            'description' => $data['description'] ?? null,
            'description_html' => $data['descriptionHtml'] ?? null,
            'thumbnail_url' => $data['thumbnailUrl'] ?? null,
            'pdf_url' => $data['pdfUrl'] ?? null,
            'video_url' => $data['videoUrl'] ?? null,
            'instructor_name' => $data['instructorName'] ?? null,
            'level' => $data['level'] ?? null,
            'category' => $data['category'] ?? null,
            'published' => $data['published'] ?? null,
            'price_cents' => $data['priceCents'] ?? null,
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
            'pdf_url' => $mapped['pdf_url'] ?? '',
            'video_url' => $mapped['video_url'] ?? '',
            'instructor_name' => $mapped['instructor_name'] ?? '',
            'level' => $mapped['level'] ?? 'beginner',
            'category' => $mapped['category'] ?? '',
            'published' => $mapped['published'] ?? false,
            'price_cents' => $mapped['price_cents'] ?? 0,
            'sort_order' => $mapped['sort_order'] ?? 0,
        ];
    }
}
