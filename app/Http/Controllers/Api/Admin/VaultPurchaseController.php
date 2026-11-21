<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\VaultPurchase;
use Illuminate\Http\Request;

class VaultPurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = VaultPurchase::query()->with(['video', 'user']);
        if ($request->filled('uid')) {
            $query->where('user_id', $request->string('uid'));
        }
        if ($request->filled('videoId')) {
            $query->where('vault_video_id', $request->string('videoId'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'purchases' => $query->orderByDesc('updated_at')->get()->map(function (VaultPurchase $purchase) {
                return [
                    ...$purchase->toPublicArray(),
                    'userName' => $purchase->user?->name,
                    'userEmail' => $purchase->user?->email,
                    'videoTitle' => $purchase->video?->title,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'uid' => ['required', 'string', 'exists:users,id'],
            'videoId' => ['required', 'string', 'exists:vault_videos,id'],
            'source' => ['nullable', 'in:purchase,admin'],
            'status' => ['nullable', 'in:pending,active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $status = $data['status'] ?? 'active';

        $purchase = VaultPurchase::query()->updateOrCreate(
            [
                'user_id' => $data['uid'],
                'vault_video_id' => $data['videoId'],
            ],
            [
                'source' => $data['source'] ?? 'admin',
                'status' => $status,
                'note' => $data['note'] ?? null,
                'requested_at' => now(),
                'granted_at' => $status === 'active' ? now() : null,
            ],
        );

        return response()->json(['purchase' => $purchase->toPublicArray()], 201);
    }

    public function show(string $uid, string $videoId)
    {
        $purchase = VaultPurchase::query()
            ->where('user_id', $uid)
            ->where('vault_video_id', $videoId)
            ->firstOrFail();

        return response()->json(['purchase' => $purchase->toPublicArray()]);
    }

    public function update(Request $request, string $uid, string $videoId)
    {
        $purchase = VaultPurchase::query()
            ->where('user_id', $uid)
            ->where('vault_video_id', $videoId)
            ->firstOrFail();

        $data = $request->validate([
            'source' => ['nullable', 'in:purchase,admin'],
            'status' => ['nullable', 'in:pending,active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $status = $data['status'] ?? $purchase->status;

        $purchase->fill([
            'source' => $data['source'] ?? $purchase->source,
            'status' => $status,
            'note' => array_key_exists('note', $data) ? $data['note'] : $purchase->note,
            'granted_at' => $status === 'active' ? ($purchase->granted_at ?? now()) : $purchase->granted_at,
        ]);
        $purchase->save();

        return response()->json(['purchase' => $purchase->toPublicArray()]);
    }

    public function destroy(string $uid, string $videoId)
    {
        VaultPurchase::query()
            ->where('user_id', $uid)
            ->where('vault_video_id', $videoId)
            ->delete();

        return response()->json(['success' => true]);
    }
}
