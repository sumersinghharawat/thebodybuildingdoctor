<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'file' => ['required', 'file'],
            'folder' => ['required', Rule::in(['courses', 'lessons', 'mentorship', 'blogs', 'marketing', 'documents', 'apps'])],
        ]);

        $file = $data['file'];
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = (string) $file->getMimeType();

        $isPdf = $extension === 'pdf' || $mime === 'application/pdf';
        $isApk = $extension === 'apk' || in_array($mime, [
            'application/vnd.android.package-archive',
            'application/java-archive',
            'application/zip',
            'application/octet-stream',
        ], true);

        if ($isPdf) {
            $request->validate([
                'file' => ['mimes:pdf', 'max:20480'],
            ]);
        } elseif ($isApk) {
            // APKs are ZIP archives and are frequently detected as
            // application/octet-stream, so validate by extension + size
            // rather than an unreliable MIME guess.
            if ($extension !== 'apk') {
                return response()->json([
                    'message' => 'Please upload a valid .apk file.',
                ], 422);
            }

            $request->validate([
                'file' => ['max:204800'],
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

        if ($isApk) {
            $path = $file->storeAs($folder, Str::random(40).'.apk', 'public');
        } else {
            $path = $file->store($folder, 'public');
        }

        $url = Storage::disk('public')->url($path);

        $payload = ['url' => $url, 'path' => $path];
        if ($isApk) {
            $payload['downloadUrl'] = route('app.download');
        }

        return response()->json($payload);
    }
}
