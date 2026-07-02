<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file'],
            'folder' => ['required', Rule::in(['courses', 'mentorship', 'blogs', 'marketing', 'documents'])],
        ]);

        $file = $data['file'];
        $isPdf = $file->getMimeType() === 'application/pdf'
            || str_ends_with(strtolower($file->getClientOriginalName()), '.pdf');

        if ($isPdf) {
            $request->validate([
                'file' => ['mimes:pdf', 'max:20480'],
            ]);
        } else {
            $request->validate([
                'file' => ['mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            ]);
        }

        $folder = match ($data['folder']) {
            'mentorship' => 'blogs',
            'documents' => 'documents',
            default => $data['folder'],
        };

        $path = $file->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url]);
    }
}
