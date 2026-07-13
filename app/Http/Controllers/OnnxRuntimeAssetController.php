<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OnnxRuntimeAssetController extends Controller
{
    private const MIME_TYPES = [
        'ort-wasm.wasm' => 'application/wasm',
        'ort-wasm-simd.wasm' => 'application/wasm',
        'ort-wasm-simd-threaded.wasm' => 'application/wasm',
        'ort-wasm-threaded.wasm' => 'application/wasm',
        'ort-wasm-threaded.js' => 'application/javascript; charset=utf-8',
        'ort-wasm-threaded.worker.js' => 'application/javascript; charset=utf-8',
    ];

    public function __invoke(string $file): BinaryFileResponse|Response
    {
        $mime = self::MIME_TYPES[$file] ?? null;

        if ($mime === null) {
            abort(404);
        }

        $path = storage_path('app/onnxruntime/'.$file);

        if (! File::isReadable($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => $mime,
            'Cross-Origin-Resource-Policy' => 'cross-origin',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
