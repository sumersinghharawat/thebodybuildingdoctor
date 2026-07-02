<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LessonController extends Controller
{
    public function store(Request $request, string $courseId)
    {
        Course::query()->findOrFail($courseId);
        $data = $this->validated($request);

        $lesson = Lesson::query()->create([
            'id' => Str::random(24),
            'course_id' => $courseId,
            ...$data,
        ]);

        $this->syncCourseStats($courseId);

        return response()->json(['lesson' => $lesson->toPublicArray()], 201);
    }

    public function update(Request $request, string $courseId, string $lessonId)
    {
        $lesson = Lesson::query()->where('course_id', $courseId)->findOrFail($lessonId);
        $lesson->update($this->validated($request, partial: true));
        $this->syncCourseStats($courseId);

        return response()->json(['lesson' => $lesson->fresh()->toPublicArray()]);
    }

    public function destroy(string $courseId, string $lessonId)
    {
        Lesson::query()->where('course_id', $courseId)->where('id', $lessonId)->delete();
        $this->syncCourseStats($courseId);

        return response()->json(['success' => true]);
    }

    public function reorder(Request $request, string $courseId)
    {
        $data = $request->validate([
            'lessonIds' => ['required', 'array', 'min:1'],
            'lessonIds.*' => ['required', 'string'],
        ]);

        $lessons = Lesson::query()->where('course_id', $courseId)->get();
        if ($lessons->count() !== count($data['lessonIds'])) {
            return response()->json(['message' => 'Lesson list must include every lesson'], 400);
        }

        foreach ($data['lessonIds'] as $index => $lessonId) {
            Lesson::query()
                ->where('course_id', $courseId)
                ->where('id', $lessonId)
                ->update(['sort_order' => $index + 1]);
        }

        return response()->json([
            'lessons' => Lesson::query()->where('course_id', $courseId)->orderBy('sort_order')->get()->map->toPublicArray(),
        ]);
    }

    private function syncCourseStats(string $courseId): void
    {
        $lessons = Lesson::query()->where('course_id', $courseId)->get();
        Course::query()->where('id', $courseId)->update([
            'lesson_count' => $lessons->count(),
            'total_duration_sec' => $lessons->sum('duration_sec'),
        ]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $data = $request->validate([
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190'],
            'order' => ['nullable', 'integer', 'min:0'],
            'durationSec' => ['nullable', 'integer', 'min:0'],
            'videoUrl' => ['nullable', 'string'],
            'contentHtml' => ['nullable', 'string'],
            'freePreview' => ['nullable', 'boolean'],
            'thumbnailUrl' => ['nullable', 'string'],
            'pdfUrl' => ['nullable', 'string', 'max:500'],
        ]);

        return [
            'title' => $data['title'] ?? null,
            'slug' => $data['slug'] ?? null,
            'sort_order' => $data['order'] ?? 0,
            'duration_sec' => $data['durationSec'] ?? 0,
            'video_url' => $data['videoUrl'] ?? '',
            'content_html' => $data['contentHtml'] ?? null,
            'free_preview' => $data['freePreview'] ?? false,
            'thumbnail_url' => $data['thumbnailUrl'] ?? null,
            'pdf_url' => $data['pdfUrl'] ?? '',
        ];
    }
}
