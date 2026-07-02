<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Enrollment::query()->with('course');
        if ($request->filled('uid')) {
            $query->where('user_id', $request->string('uid'));
        }
        if ($request->filled('courseId')) {
            $query->where('course_id', $request->string('courseId'));
        }

        return response()->json([
            'enrollments' => $query->get()->map->toPublicArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'uid' => ['required', 'string', 'exists:users,id'],
            'courseId' => ['required', 'string', 'exists:courses,id'],
            'source' => ['nullable', 'in:free,purchase,admin'],
            'status' => ['nullable', 'in:active,expired,revoked'],
            'expiresAt' => ['nullable', 'date'],
        ]);

        $enrollment = Enrollment::query()->updateOrCreate(
            [
                'user_id' => $data['uid'],
                'course_id' => $data['courseId'],
            ],
            [
                'enrolled_at' => now(),
                'source' => $data['source'] ?? 'admin',
                'status' => $data['status'] ?? 'active',
                'expires_at' => $data['expiresAt'] ?? null,
            ],
        );

        return response()->json(['enrollment' => $enrollment->toPublicArray()], 201);
    }

    public function show(string $uid, string $courseId)
    {
        $enrollment = Enrollment::query()
            ->where('user_id', $uid)
            ->where('course_id', $courseId)
            ->firstOrFail();

        return response()->json(['enrollment' => $enrollment->toPublicArray()]);
    }

    public function update(Request $request, string $uid, string $courseId)
    {
        $enrollment = Enrollment::query()
            ->where('user_id', $uid)
            ->where('course_id', $courseId)
            ->firstOrFail();

        $data = $request->validate([
            'source' => ['nullable', 'in:free,purchase,admin'],
            'status' => ['nullable', 'in:active,expired,revoked'],
            'expiresAt' => ['nullable', 'date'],
        ]);

        $enrollment->update([
            'source' => $data['source'] ?? $enrollment->source,
            'status' => $data['status'] ?? $enrollment->status,
            'expires_at' => array_key_exists('expiresAt', $data) ? $data['expiresAt'] : $enrollment->expires_at,
        ]);

        return response()->json(['enrollment' => $enrollment->fresh()->toPublicArray()]);
    }

    public function destroy(string $uid, string $courseId)
    {
        Enrollment::query()
            ->where('user_id', $uid)
            ->where('course_id', $courseId)
            ->delete();

        return response()->json(['success' => true]);
    }
}
