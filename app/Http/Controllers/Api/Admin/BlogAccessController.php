<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogAccess;
use Illuminate\Http\Request;

class BlogAccessController extends Controller
{
    public function index()
    {
        return response()->json([
            'grants' => BlogAccess::query()->orderByDesc('granted_at')->get()->map->toPublicArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'uid' => ['required', 'string', 'exists:users,id'],
            'status' => ['nullable', 'in:active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $grant = BlogAccess::query()->updateOrCreate(
            ['user_id' => $data['uid']],
            [
                'granted_at' => now(),
                'status' => $data['status'] ?? 'active',
                'note' => $data['note'] ?? null,
            ],
        );

        return response()->json(['blogAccess' => $grant->toPublicArray()], 201);
    }

    public function show(string $uid)
    {
        return response()->json([
            'blogAccess' => BlogAccess::query()->findOrFail($uid)->toPublicArray(),
        ]);
    }

    public function update(Request $request, string $uid)
    {
        $grant = BlogAccess::query()->findOrFail($uid);
        $data = $request->validate([
            'status' => ['nullable', 'in:active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);
        $grant->update($data);

        return response()->json(['blogAccess' => $grant->fresh()->toPublicArray()]);
    }

    public function destroy(string $uid)
    {
        BlogAccess::query()->where('user_id', $uid)->delete();

        return response()->json(['success' => true]);
    }
}
