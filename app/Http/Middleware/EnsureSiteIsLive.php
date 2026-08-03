<?php

namespace App\Http\Middleware;

use App\Support\SiteMaintenance;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureSiteIsLive
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! SiteMaintenance::isActive()) {
            return $next($request);
        }

        $until = SiteMaintenance::until();
        $payload = [
            'siteName' => config('app.name', 'The Bodybuilding Doctor'),
            'until' => $until?->toIso8601String(),
            'untilLabel' => $until?->timezone(config('app.timezone'))->format('g:i A, M j, Y'),
        ];

        if ($request->expectsJson() || $request->is('api/*')) {
            $response = response()->json([
                'message' => 'The website is under maintenance.',
                'until' => $payload['until'],
                'untilLabel' => $payload['untilLabel'],
            ], 503);

            if ($until) {
                $response->headers->set('Retry-After', (string) max(0, $until->getTimestamp() - now()->getTimestamp()));
            }

            return $response;
        }

        $response = Inertia::render('Maintenance', $payload)
            ->toResponse($request)
            ->setStatusCode(503);

        if ($until) {
            $response->headers->set('Retry-After', (string) max(0, $until->getTimestamp() - now()->getTimestamp()));
        }

        return $response;
    }
}
