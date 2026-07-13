<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\Response;

class ConfigureStatefulAuthForRequest
{
    /**
     * Align session, Sanctum, and generated URLs with the current request host.
     *
     * Local dev often uses Herd/Valet (.test, HTTPS) while APP_URL still points
     * at http://localhost:8000, which breaks Sanctum SPA auth and causes mixed content.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment('local')) {
            return $next($request);
        }

        $host = $request->getHost();
        $httpHost = $request->getHttpHost();
        $rootUrl = $request->getSchemeAndHttpHost();

        $stateful = config('sanctum.stateful', []);
        Config::set('sanctum.stateful', array_values(array_unique(array_merge(
            $stateful,
            array_filter([$host, $httpHost, $rootUrl]),
        ))));

        if ($request->isSecure()) {
            Config::set('session.secure', true);
            URL::forceScheme('https');
        }

        $configuredHost = parse_url((string) config('app.url'), PHP_URL_HOST);

        if ($configuredHost !== $host) {
            Config::set('app.url', $rootUrl);
            URL::forceRootUrl($rootUrl);
        }

        return $next($request);
    }
}
