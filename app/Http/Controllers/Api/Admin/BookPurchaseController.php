<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookPurchase;
use Illuminate\Http\Request;

class BookPurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = BookPurchase::query()->with(['book', 'user']);
        if ($request->filled('uid')) {
            $query->where('user_id', $request->string('uid'));
        }
        if ($request->filled('bookId')) {
            $query->where('book_id', $request->string('bookId'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'purchases' => $query->orderByDesc('updated_at')->get()->map(function (BookPurchase $purchase) {
                return [
                    ...$purchase->toPublicArray(),
                    'userName' => $purchase->user?->name,
                    'userEmail' => $purchase->user?->email,
                    'bookTitle' => $purchase->book?->title,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'uid' => ['required', 'string', 'exists:users,id'],
            'bookId' => ['required', 'string', 'exists:books,id'],
            'source' => ['nullable', 'in:purchase,admin'],
            'status' => ['nullable', 'in:pending,active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $status = $data['status'] ?? 'active';

        $purchase = BookPurchase::query()->updateOrCreate(
            [
                'user_id' => $data['uid'],
                'book_id' => $data['bookId'],
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

    public function show(string $uid, string $bookId)
    {
        $purchase = BookPurchase::query()
            ->where('user_id', $uid)
            ->where('book_id', $bookId)
            ->firstOrFail();

        return response()->json(['purchase' => $purchase->toPublicArray()]);
    }

    public function update(Request $request, string $uid, string $bookId)
    {
        $purchase = BookPurchase::query()
            ->where('user_id', $uid)
            ->where('book_id', $bookId)
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

    public function destroy(string $uid, string $bookId)
    {
        BookPurchase::query()
            ->where('user_id', $uid)
            ->where('book_id', $bookId)
            ->delete();

        return response()->json(['success' => true]);
    }
}
