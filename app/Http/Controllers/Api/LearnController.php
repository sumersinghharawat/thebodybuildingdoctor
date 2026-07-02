<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Services\LessonAccessService;
use App\Services\PlaybackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class LearnController extends Controller
{
    public function __construct(private LessonAccessService $access) {}

    public function courses(Request $request)
    {
        $user = $request->user();
        $enrolledIds = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('course_id');

        $enrolled = Course::query()
            ->whereIn('id', $enrolledIds)
            ->orderBy('sort_order')
            ->get()
            ->map->toPublicArray();

        $browse = Course::query()
            ->where('published', true)
            ->whereNotIn('id', $enrolledIds)
            ->orderBy('sort_order')
            ->get()
            ->map->toPublicArray();

        return response()->json([
            'enrolledCourses' => $enrolled,
            'browseCourses' => $browse,
        ]);
    }

    public function showCourse(Request $request, string $courseId)
    {
        $course = Course::query()->where('published', true)->findOrFail($courseId);
        $enrolled = $this->access->isEnrolled($request->user(), $courseId);

        $lessons = $course->lessons->map(function (Lesson $lesson) use ($enrolled) {
            $row = $lesson->toLearnerArray(false);
            $row['locked'] = ! $enrolled && ! $lesson->free_preview;

            return $row;
        });

        return response()->json([
            'course' => $course->toPublicArray(),
            'enrolled' => $enrolled,
            'lessons' => $lessons,
        ]);
    }

    public function playback(Request $request, string $courseId, string $lessonId)
    {
        $lesson = Lesson::query()->where('course_id', $courseId)->findOrFail($lessonId);

        if (! $this->access->canAccessLesson($request->user(), $courseId, $lesson)) {
            return response()->json(['message' => 'Enrollment required'], 403);
        }

        $streamPath = URL::to("/api/learn/courses/{$courseId}/lessons/{$lessonId}/stream");
        $playback = PlaybackService::resolve($lesson->video_url, $streamPath);

        if (! $playback) {
            return response()->json(['message' => 'Video unavailable'], 404);
        }

        if ($playback['provider'] === 'file' && $request->bearerToken()) {
            $playback['playbackUrl'] = URL::temporarySignedRoute(
                'learn.stream',
                now()->addHours(3),
                ['courseId' => $courseId, 'lessonId' => $lessonId],
            );
        }

        return response()->json(['playback' => $playback]);
    }

    public function stream(Request $request, string $courseId, string $lessonId)
    {
        if (! $request->hasValidSignature() && ! $request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = $request->user();
        $lesson = Lesson::query()->where('course_id', $courseId)->findOrFail($lessonId);

        if ($user && ! $this->access->canAccessLesson($user, $courseId, $lesson)) {
            return response()->json(['message' => 'Enrollment required'], 403);
        }

        $url = trim($lesson->video_url);
        if ($url === '' || preg_match('/youtube\.com|youtu\.be|vimeo\.com/i', $url)) {
            return response()->json(['message' => 'Stream not available'], 400);
        }

        return redirect()->away($url);
    }

    public function showLesson(Request $request, string $courseId, string $lessonId)
    {
        $course = Course::query()->where('published', true)->findOrFail($courseId);
        $lesson = Lesson::query()->where('course_id', $courseId)->findOrFail($lessonId);

        if (! $this->access->canAccessLesson($request->user(), $courseId, $lesson)) {
            return response()->json(['message' => 'Enrollment required'], 403);
        }

        $lessons = $course->lessons;
        $index = $lessons->search(fn (Lesson $l) => $l->id === $lessonId);

        return response()->json([
            'course' => $course->toPublicArray(),
            'lesson' => $lesson->toLearnerArray(false),
            'prevLesson' => $index > 0 ? [
                'id' => $lessons[$index - 1]->id,
                'title' => $lessons[$index - 1]->title,
            ] : null,
            'nextLesson' => $index >= 0 && $index < $lessons->count() - 1 ? [
                'id' => $lessons[$index + 1]->id,
                'title' => $lessons[$index + 1]->title,
            ] : null,
        ]);
    }

    public function mentorship(Request $request)
    {
        $mentorship = Blog::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->orderByDesc('published_at')
            ->get()
            ->map->toPublicArray();

        return response()->json(['mentorship' => $mentorship]);
    }
}
