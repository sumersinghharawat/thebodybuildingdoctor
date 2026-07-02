<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:5120', 'mimes:jpg,jpeg,png,webp,gif'],
            'folder' => ['required', 'in:courses,mentorship,blogs,marketing'],
        ]);

        $folder = match ($data['folder']) {
            'mentorship' => 'blogs',
            default => $data['folder'],
        };
        $path = $data['file']->store($folder, 'public');
        $url = Storage::disk('public')->url($path);

        return response()->json(['url' => $url]);
    }
}
