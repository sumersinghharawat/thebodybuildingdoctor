<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Allow face enrollment for authenticated users or valid signed enrollment links.
 */
class EnsureFaceEnrollAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() instanceof User) {
            return $next($request);
        }

        if ($request->hasValidSignature() && $request->filled('user')) {
            $user = User::query()->find($request->query('user'));

            if ($user instanceof User) {
                Auth::login($user);

                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'A valid enrollment session or signed link is required.',
            ], 403);
        }

        return redirect()
            ->route('face.login')
            ->with('error', 'Your enrollment link is invalid or has expired. Contact your administrator.');
    }
}
