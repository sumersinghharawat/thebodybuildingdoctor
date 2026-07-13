<?php

namespace App\Http\Controllers;

use App\Http\Requests\FaceAuth\FaceEnrollRequest;
use App\Http\Requests\FaceAuth\FaceLoginRequest;
use App\Models\FaceAuthAttempt;
use App\Services\FaceAuth\FaceEnrollmentService;
use App\Services\FaceAuth\FaceMatchingService;
use App\Services\FaceAuth\FaceRecognitionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use RuntimeException;
use Throwable;

class FaceLoginController extends Controller
{
    public function __construct(
        private readonly FaceRecognitionService $recognition,
        private readonly FaceMatchingService $matching,
        private readonly FaceEnrollmentService $enrollment,
    ) {}

    public function showLogin(): View
    {
        $this->recognition->ensureModelsInstalled();

        return view('face.login', [
            'config' => $this->recognition->clientConfig(),
        ]);
    }

    public function authenticate(FaceLoginRequest $request): JsonResponse
    {
        try {
            $this->recognition->ensureModelsInstalled();

            $match = $this->matching->findBestMatch($request->descriptor());

            if ($match === null) {
                $this->matching->logAttempt(
                    $request,
                    FaceAuthAttempt::TYPE_LOGIN,
                    FaceAuthAttempt::STATUS_FAILED,
                    reason: 'Face not recognized.',
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Face not recognized.',
                ], 401);
            }

            $user = $match['user'];

            if (! $user->hasAppAccess()) {
                $this->matching->logAttempt(
                    $request,
                    FaceAuthAttempt::TYPE_LOGIN,
                    FaceAuthAttempt::STATUS_REJECTED,
                    $user,
                    'User does not have application access.',
                    $match['similarity'],
                );

                return response()->json([
                    'success' => false,
                    'message' => 'Your account does not have access to this application.',
                ], 403);
            }

            Auth::login($user, remember: true);
            $request->session()->regenerate();

            $this->matching->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_LOGIN,
                FaceAuthAttempt::STATUS_SUCCESS,
                $user,
                distance: $match['similarity'],
            );

            return response()->json([
                'success' => true,
                'message' => 'Authentication successful.',
                'redirect' => config('faceauth.redirect_after_login', '/dashboard'),
            ]);
        } catch (RuntimeException $exception) {
            $this->matching->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_LOGIN,
                FaceAuthAttempt::STATUS_FAILED,
                reason: $exception->getMessage(),
            );

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 500);
        } catch (Throwable $exception) {
            report($exception);

            $this->matching->logAttempt(
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

    public function showEnroll(Request $request): View
    {
        $this->recognition->ensureModelsInstalled();

        return view('face.enroll', [
            'config' => $this->recognition->clientConfig(),
            'user' => $request->user(),
            'alreadyEnrolled' => $this->enrollment->isEnrolled($request->user()),
        ]);
    }

    public function enroll(FaceEnrollRequest $request): JsonResponse
    {
        try {
            $this->recognition->ensureModelsInstalled();

            $user = $request->user();

            if ($user === null) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required before enrollment.',
                ], 401);
            }

            $this->enrollment->enroll($user, $request->samples());

            $this->matching->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_ENROLL,
                FaceAuthAttempt::STATUS_SUCCESS,
                $user,
            );

            return response()->json([
                'success' => true,
                'message' => 'Face enrollment completed successfully.',
                'redirect' => config('faceauth.redirect_after_enroll', '/dashboard'),
            ]);
        } catch (RuntimeException $exception) {
            $this->matching->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_ENROLL,
                FaceAuthAttempt::STATUS_FAILED,
                $request->user(),
                $exception->getMessage(),
            );

            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 422);
        } catch (Throwable $exception) {
            report($exception);

            $this->matching->logAttempt(
                $request,
                FaceAuthAttempt::TYPE_ENROLL,
                FaceAuthAttempt::STATUS_FAILED,
                $request->user(),
                'Unexpected enrollment error.',
            );

            return response()->json([
                'success' => false,
                'message' => 'Enrollment failed due to a server error.',
            ], 500);
        }
    }
}
