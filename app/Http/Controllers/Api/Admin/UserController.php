<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogAccess;
use App\Models\User;
use App\Services\FaceAuth\FaceEnrollmentLinkService;
use App\Services\FaceAuth\FaceEnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct(
        private readonly FaceEnrollmentLinkService $faceEnrollmentLinks,
        private readonly FaceEnrollmentService $faceEnrollment,
    ) {}

    public function index()
    {
        return response()->json([
            'users' => User::query()->orderBy('name')->get()->map(fn (User $u) => $this->serialize($u)),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'name' => ['required', 'string', 'max:120'],
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['string', 'max:60'],
        ]);

        $user = User::query()->create([
            'id' => (string) Str::uuid(),
            'email' => $data['email'],
            'password' => $data['password'],
            'name' => $data['name'],
            'roles' => $data['roles'],
        ]);

        return response()->json(['user' => $this->serialize($user)], 201);
    }

    public function show(string $uid)
    {
        return response()->json(['user' => $this->serialize(User::query()->findOrFail($uid))]);
    }

    public function update(Request $request, string $uid)
    {
        $user = User::query()->findOrFail($uid);
        $data = $request->validate([
            'email' => ['sometimes', 'email', 'unique:users,email,'.$uid.',id'],
            'password' => ['nullable', 'string', 'min:8'],
            'name' => ['sometimes', 'string', 'max:120'],
            'roles' => ['sometimes', 'array', 'min:1'],
            'roles.*' => ['string', 'max:60'],
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        if (isset($data['roles'])) {
            $user->roles = $data['roles'];
        }
        $user->fill(collect($data)->only(['email', 'name', 'password'])->filter()->all());
        $user->save();

        return response()->json(['user' => $this->serialize($user)]);
    }

    public function destroy(string $uid)
    {
        User::query()->where('id', $uid)->delete();

        return response()->json(['success' => true]);
    }

    public function issueFaceEnrollLink(Request $request, string $uid)
    {
        $user = User::query()->findOrFail($uid);

        $data = $request->validate([
            'hours' => ['nullable', 'integer', 'min:1', 'max:168'],
        ]);

        $result = $this->faceEnrollmentLinks->generate($user, $data['hours'] ?? 24);

        return response()->json([
            'user' => $this->serialize($user),
            ...$result,
        ]);
    }

    public function revokeFaceLock(string $uid)
    {
        $user = User::query()->findOrFail($uid);

        if (! $this->faceEnrollment->isEnrolled($user)) {
            return response()->json([
                'message' => 'This user does not have face lock enrolled.',
            ], 422);
        }

        $this->faceEnrollment->revoke($user);

        return response()->json([
            'success' => true,
            'user' => $this->serialize($user->refresh()),
        ]);
    }

    private function serialize(User $user): array
    {
        return [
            'uid' => $user->id,
            'email' => $user->email,
            'name' => $user->name,
            'roles' => $user->roleList(),
            'createdAt' => $user->created_at?->toISOString(),
            'hasFaceRegistered' => $user->hasFaceRegistered(),
            'faceRegisteredAt' => $user->face_registered_at?->toISOString(),
        ];
    }
}
