<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;

class LessonAccessService
{
    public function canAccessLesson(User $user, string $courseId, Lesson $lesson): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($lesson->free_preview) {
            return true;
        }

        return Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->exists();
    }

    public function isEnrolled(User $user, string $courseId): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('status', 'active')
            ->exists();
    }
}
