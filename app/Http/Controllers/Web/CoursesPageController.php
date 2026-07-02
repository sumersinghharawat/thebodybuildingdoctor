<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Inertia\Inertia;

class CoursesPageController extends Controller
{
    public function __invoke()
    {
        $courses = Course::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->get()
            ->map->toPublicArray();

        return Inertia::render('Courses/Index', [
            'courses' => $courses,
            'siteName' => config('app.name', 'The Bodybuilding Doctor'),
        ]);
    }
}
