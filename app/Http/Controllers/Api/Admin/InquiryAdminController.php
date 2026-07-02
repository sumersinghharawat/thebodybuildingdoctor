<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryAdminController extends Controller
{
    public function index()
    {
        return response()->json([
            'inquiries' => Inquiry::query()->orderByDesc('created_at')->get()->map->toPublicArray(),
        ]);
    }

    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            'status' => ['required', 'in:new,contacted,closed'],
        ]);

        $inquiry = Inquiry::query()->findOrFail($id);
        $inquiry->update(['status' => $data['status']]);

        return response()->json(['inquiry' => $inquiry->fresh()->toPublicArray()]);
    }
}
