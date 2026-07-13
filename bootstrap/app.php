<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->prepend([
            \App\Http\Middleware\ConfigurePasskeysForRequest::class,
            \App\Http\Middleware\ConfigureStatefulAuthForRequest::class,
        ]);

        // Cross-origin isolation is not required for single-threaded ONNX WASM.
        // $middleware->append([
        //     \App\Http\Middleware\EnableFaceAuthIsolation::class,
        // ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'app.access' => \App\Http\Middleware\EnsureAppAccess::class,
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'face.https' => \App\Http\Middleware\EnsureFaceAuthHttps::class,
            'face.enroll' => \App\Http\Middleware\EnsureFaceEnrollAccess::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
