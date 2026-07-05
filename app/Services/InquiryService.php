<?php

namespace App\Services;

use App\Models\Course;
use App\Models\Inquiry;
use Illuminate\Support\Str;

class InquiryService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public static function create(array $data): Inquiry
    {
        $courseTitle = $data['courseTitle'] ?? $data['course_title'] ?? '';
        $courseId = $data['courseId'] ?? $data['course_id'] ?? null;

        if ($courseId && $courseTitle === '') {
            $course = Course::query()->find($courseId);
            $courseTitle = $course?->title ?? '';
        }

        $inquiry = Inquiry::query()->create([
            'id' => Str::random(24),
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'type' => $data['type'] ?? 'courses',
            'course_id' => $courseId,
            'course_title' => $courseTitle ?: null,
            'message' => $data['message'] ?? null,
            'status' => 'new',
        ]);

        InquiryNotificationService::notifyAdmins($inquiry);

        return $inquiry;
    }

    public static function hasPendingCourseRequest(string $email, string $courseId): bool
    {
        return Inquiry::query()
            ->where('email', $email)
            ->where('course_id', $courseId)
            ->where('status', 'new')
            ->exists();
    }
}
