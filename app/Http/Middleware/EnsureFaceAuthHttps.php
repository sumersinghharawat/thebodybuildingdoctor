<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Redirect face authentication routes to HTTPS when required.
 */
class EnsureFaceAuthHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('faceauth.require_https', true)) {
            return $next($request);
        }

        if (app()->environment('local', 'testing')) {
            return $next($request);
        }

        if ($request->secure()) {
            return $next($request);
        }

        return redirect()->secure($request->getRequestUri());
    }
}
