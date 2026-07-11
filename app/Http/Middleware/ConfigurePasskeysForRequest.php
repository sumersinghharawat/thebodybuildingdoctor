<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Symfony\Component\HttpFoundation\Response;

class ConfigurePasskeysForRequest
{
    /**
     * Align WebAuthn relying party settings with the current request host.
     *
     * Local dev often serves on 127.0.0.1 while APP_URL uses localhost.
     * WebAuthn rejects ceremonies when rpId does not match the browser host.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        if (app()->environment('local') && in_array($host, ['localhost', '127.0.0.1'], true)) {
            Config::set('passkeys.relying_party_id', $host);
            Config::set('passkeys.allowed_origins', array_values(array_unique(array_filter([
                config('app.url'),
                $request->getSchemeAndHttpHost(),
                'http://localhost:8000',
                'http://127.0.0.1:8000',
            ]))));
        }

        return $next($request);
    }
}
