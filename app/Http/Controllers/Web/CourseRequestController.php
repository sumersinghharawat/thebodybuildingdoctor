<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\InquiryService;
use App\Services\LessonAccessService;
use Illuminate\Http\Request;

class CourseRequestController extends Controller
{
    public function __construct(private LessonAccessService $access) {}

    public function store(Request $request, string $courseId)
    {
        $course = Course::query()->where('published', true)->findOrFail($courseId);
        $user = $request->user();

        if ($this->access->isEnrolled($user, $courseId)) {
            return back()->with('error', 'You are already enrolled in this course.');
        }

        if (InquiryService::hasPendingCourseRequest($user->email, $courseId)) {
            return back()->with('success', 'Your request for this course is already pending.');
        }

        InquiryService::create([
            'name' => $user->name,
            'email' => $user->email,
            'type' => 'courses',
            'courseId' => $course->id,
            'courseTitle' => $course->title,
            'message' => 'Course access requested from the member area.',
        ]);

        return back()->with('success', 'Access request sent. An administrator will contact you soon.');
    }
}
