<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Services\LessonAccessService;
use Inertia\Inertia;

class LearnPageController extends Controller
{
    public function __construct(private LessonAccessService $access) {}

    public function index()
    {
        $user = auth()->user();
        $enrolledIds = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->pluck('course_id');

        return Inertia::render('Learn/Index', [
            'enrolledCourses' => Course::query()->whereIn('id', $enrolledIds)->orderBy('sort_order')->get()->map->toPublicArray(),
            'browseCourses' => Course::query()->where('published', true)->whereNotIn('id', $enrolledIds)->orderBy('sort_order')->get()->map->toPublicArray(),
        ]);
    }

    public function showCourse(string $courseId)
    {
        $course = Course::query()->where('published', true)->findOrFail($courseId);
        $enrolled = $this->access->isEnrolled(auth()->user(), $courseId);

        $lessons = $course->lessons->map(function (Lesson $lesson) use ($enrolled) {
            return [
                ...$lesson->toLearnerArray(false),
                'locked' => ! $enrolled && ! $lesson->free_preview,
            ];
        });

        return Inertia::render('Learn/Course', [
            'course' => $course->toPublicArray(),
            'enrolled' => $enrolled,
            'lessons' => $lessons,
        ]);
    }

    public function showLesson(string $courseId, string $lessonId)
    {
        $course = Course::query()->where('published', true)->findOrFail($courseId);
        $lesson = Lesson::query()->where('course_id', $courseId)->findOrFail($lessonId);

        if (! $this->access->canAccessLesson(auth()->user(), $courseId, $lesson)) {
            return redirect()->route('learn.courses.show', $courseId);
        }

        $lessons = $course->lessons;
        $index = $lessons->search(fn (Lesson $l) => $l->id === $lessonId);

        return Inertia::render('Learn/Lesson', [
            'course' => $course->toPublicArray(),
            'lesson' => $lesson->toLearnerArray(false),
            'prevLesson' => $index > 0 ? ['id' => $lessons[$index - 1]->id, 'title' => $lessons[$index - 1]->title] : null,
            'nextLesson' => $index >= 0 && $index < $lessons->count() - 1
                ? ['id' => $lessons[$index + 1]->id, 'title' => $lessons[$index + 1]->title]
                : null,
        ]);
    }
}
