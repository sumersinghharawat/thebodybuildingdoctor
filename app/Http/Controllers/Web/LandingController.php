<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\InquiryService;
use App\Support\LandingAppSection;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function __invoke()
    {
        $query = Course::query()->where('published', true)->orderBy('sort_order');
        $totalCourseCount = (clone $query)->count();

        $courses = $query
            ->limit(6)
            ->get()
            ->map->toPublicArray();

        return Inertia::render('Landing', [
            'courses' => $courses,
            'totalCourseCount' => $totalCourseCount,
            'siteName' => config('app.name', 'The Bodybuilding Doctor'),
            'appSection' => LandingAppSection::get(),
        ]);
    }

    public function storeInquiry(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['nullable', 'string', 'max:40'],
            'type' => ['required', 'in:mentorship,courses,both'],
            'courseId' => ['nullable', 'string'],
            'courseTitle' => ['nullable', 'string'],
            'message' => ['nullable', 'string', 'max:5000'],
        ]);

        InquiryService::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'type' => $data['type'],
            'courseId' => $data['courseId'] ?? null,
            'courseTitle' => $data['courseTitle'] ?? null,
            'message' => $data['message'] ?? null,
        ]);

        return back()->with('success', 'Request submitted. We will contact you soon.');
    }
}
