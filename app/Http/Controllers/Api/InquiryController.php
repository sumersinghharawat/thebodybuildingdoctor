<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\InquiryService;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'type' => ['required', 'in:mentorship,courses,both'],
            'courseId' => ['nullable', 'string', 'max:64'],
            'courseTitle' => ['nullable', 'string', 'max:190'],
            'message' => ['nullable', 'string', 'max:5000'],
        ]);

        $courseTitle = $data['courseTitle'] ?? '';
        if (! empty($data['courseId']) && $courseTitle === '') {
            $course = Course::query()->find($data['courseId']);
            $courseTitle = $course?->title ?? '';
        }

        $inquiry = InquiryService::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'type' => $data['type'],
            'courseId' => $data['courseId'] ?? null,
            'courseTitle' => $courseTitle ?: null,
            'message' => $data['message'] ?? null,
        ]);

        return response()->json(['inquiry' => $inquiry->toPublicArray()], 201);
    }
}
