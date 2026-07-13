<?php

namespace App\Http\Controllers;

use App\Http\Requests\FaceAuth\FaceDescriptorRequest;
use App\Http\Requests\FaceAuth\FaceLoginRequest;
use App\Models\FaceAuthAttempt;
use App\Services\FaceAuth\FaceRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class FaceAuthController extends Controller
{
    public function __construct(
        private readonly FaceRecognitionService $faces,
    ) {}

    public function showLogin(Request $request): Response
    {
        $action = $this->faces->randomLivenessAction();
        $request->session()->put('face_liveness_action', $action);

        return Inertia::render('Auth/Login', [
            'config' => $this->faces->clientConfig(),
            'livenessAction' => $action,
            'status' => session('status'),
            'error' => session('error'),
        ]);
    }

    public function login(FaceLoginRequest $request): JsonResponse
    {
        $expectedAction = $request->session()->get('face_liveness_action');

        if (! is_string($expectedAction) || $request->livenessAction() !== $expectedAction) {
            $this->faces->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_LOGIN,
                FaceAuthAttempt::STATUS_REJECTED,
                reason: 'Liveness challenge failed.',
            );

            return response()->json([
                'success' => false,
                'message' => 'Liveness check failed. Please complete the challenge and try again.',
            ], 422);
        }

        try {
            $match = $this->faces->findBestMatch($request->descriptor());

            if ($match === null) {
                $anyEnrolled = \App\Models\User::query()
                    ->whereNotNull('face_descriptor')
                    ->whereNotNull('face_registered_at')
                    ->exists();

                $message = $anyEnrolled
                    ? 'Face not recognized.'
                    : "You haven't registered Face Lock yet.";

                $this->faces->logAttempt(
                    $request,
                    FaceAuthAttempt::TYPE_LOGIN,
                    FaceAuthAttempt::STATUS_FAILED,
                    reason: $message,
                );

                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], 401);
            }

            $user = $match['user'];

            if (! $user->hasAppAccess()) {
                $this->faces->logAttempt(
                    $request,
                    FaceAuthAttempt::TYPE_LOGIN,
                    FaceAuthAttempt::STATUS_REJECTED,
                    $user,
                    'User does not have application access.',
                    $match['distance'],
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Your account does not have access to this application.',
                ], 403);
            }

            Auth::login($user, remember: true);
            $request->session()->regenerate();
            $request->session()->forget('face_liveness_action');

            $this->faces->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_LOGIN,
                FaceAuthAttempt::STATUS_SUCCESS,
                $user,
                distance: $match['distance'],
            );

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful.',
                'redirect' => config('faceauth.redirect_after_login', '/dashboard'),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            $this->faces->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_LOGIN,
                FaceAuthAttempt::STATUS_FAILED,
                reason: 'Unexpected authentication error.',
            );

            return response()->json([
                'success' => false,
                'message' => 'Authentication failed due to a server error.',
            ], 500);
        }
    }

    public function register(FaceDescriptorRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        try {
            $this->faces->register($user, $request->samples());

            $this->faces->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_ENROLL,
                FaceAuthAttempt::STATUS_SUCCESS,
                $user,
            );

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Face Lock registered successfully.',
                    'hasFaceRegistered' => true,
                ]);
            }

            return back()->with('status', 'Face Lock registered successfully.');
        } catch (Throwable $exception) {
            report($exception);

            $this->faces->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_ENROLL,
                FaceAuthAttempt::STATUS_FAILED,
                $user,
                $exception->getMessage(),
            );

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $exception->getMessage() ?: 'Unable to register Face Lock.',
                ], 422);
            }

            return back()->withErrors(['face' => 'Unable to register Face Lock.']);
        }
    }

    public function update(FaceDescriptorRequest $request): JsonResponse|RedirectResponse
    {
        return $this->register($request);
    }

    public function delete(Request $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        $this->faces->delete($user);

        $this->faces->logAttempt(
            $request,
            FaceAuthAttempt::TYPE_ENROLL,
            FaceAuthAttempt::STATUS_SUCCESS,
            $user,
            'Face Lock removed.',
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Face Lock removed.',
                'hasFaceRegistered' => false,
            ]);
        }

        return back()->with('status', 'Face Lock removed.');
    }
}
