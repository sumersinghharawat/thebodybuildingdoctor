<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\Course;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'androidPlayStoreUrl' => config('marketing.android_play_store_url'),
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

        Inquiry::query()->create([
            'id' => Str::random(24),
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'type' => $data['type'],
            'course_id' => $data['courseId'] ?? null,
            'course_title' => $data['courseTitle'] ?? null,
            'message' => $data['message'] ?? null,
            'status' => 'new',
        ]);

        return back()->with('success', 'Request submitted. We will contact you soon.');
    }
}
