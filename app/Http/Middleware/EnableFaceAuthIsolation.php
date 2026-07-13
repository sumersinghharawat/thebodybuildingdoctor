<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enable cross-origin isolation for Faceplugin / ONNX Runtime in the browser.
 */
class EnableFaceAuthIsolation
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! str_starts_with($request->path(), 'face')) {
            return $response;
        }

        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->set('Cross-Origin-Embedder-Policy', 'credentialless');

        return $response;
    }
}
