<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogAccess;
use App\Models\User;
use App\Support\Roles;
use Illuminate\Http\Request;

class BlogAccessController extends Controller
{
    /**
     * Mentorship membership is primarily the media_channel role.
     * blog_access rows are optional notes/overrides; the live dump never had any.
     */
    public function index()
    {
        $grants = BlogAccess::query()->get()->keyBy('user_id');

        $members = User::query()
            ->orderBy('name')
            ->get()
            ->filter(function (User $user) use ($grants) {
                if ($grants->has($user->id)) {
                    return true;
                }

                return Roles::isMediaChannel($user->roleList());
            })
            ->map(fn (User $user) => $this->serializeGrant($user, $grants->get($user->id)))
            ->values();

        return response()->json([
            'grants' => $members,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'uid' => ['required', 'string', 'exists:users,id'],
            'status' => ['nullable', 'in:active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $user = User::query()->findOrFail($data['uid']);
        $status = $data['status'] ?? 'active';

        $this->syncMemberRole($user, $status === 'active');

        $grant = BlogAccess::query()->updateOrCreate(
            ['user_id' => $data['uid']],
            [
                'granted_at' => now(),
                'status' => $status,
                'note' => $data['note'] ?? null,
            ],
        );

        return response()->json([
            'mentorshipAccess' => $this->serializeGrant($user->fresh(), $grant),
        ], 201);
    }

    public function show(string $uid)
    {
        $user = User::query()->findOrFail($uid);
        $grant = BlogAccess::query()->find($uid);

        if (! $grant && ! Roles::isMediaChannel($user->roleList())) {
            abort(404);
        }

        return response()->json([
            'mentorshipAccess' => $this->serializeGrant($user, $grant),
        ]);
    }

    public function update(Request $request, string $uid)
    {
        $user = User::query()->findOrFail($uid);
        $data = $request->validate([
            'status' => ['nullable', 'in:active,revoked'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $grant = BlogAccess::query()->firstOrNew(['user_id' => $uid]);
        if (! $grant->exists) {
            $grant->granted_at = now();
        }

        if (array_key_exists('status', $data) && $data['status'] !== null) {
            $grant->status = $data['status'];
            $this->syncMemberRole($user, $data['status'] === 'active');
        }

        if (array_key_exists('note', $data)) {
            $grant->note = $data['note'];
        }

        $grant->save();

        return response()->json([
            'mentorshipAccess' => $this->serializeGrant($user->fresh(), $grant->fresh()),
        ]);
    }

    public function destroy(string $uid)
    {
        $user = User::query()->findOrFail($uid);
        $this->syncMemberRole($user, false);
        BlogAccess::query()->where('user_id', $uid)->delete();

        return response()->json(['success' => true]);
    }

    private function syncMemberRole(User $user, bool $grant): void
    {
        $roles = $user->roleList();

        if ($grant) {
            if (! Roles::isMediaChannel($roles)) {
                $roles[] = 'media_channel';
                $user->roles = array_values(array_unique($roles));
                $user->save();
            }

            return;
        }

        // Keep admin accounts intact; only remove the member mentorship role.
        if (Roles::isMediaChannel($roles) && ! Roles::isAdmin($roles)) {
            $user->roles = array_values(array_filter(
                $roles,
                fn (string $role) => $role !== 'media_channel',
            ));
            $user->save();
        }
    }

    private function serializeGrant(User $user, ?BlogAccess $grant): array
    {
        $viaRole = Roles::isMediaChannel($user->roleList());

        return [
            'uid' => $user->id,
            'userName' => $user->name,
            'userEmail' => $user->email,
            'grantedAt' => $grant?->granted_at?->toISOString()
                ?? $user->created_at?->toISOString(),
            'status' => $grant?->status ?? ($viaRole ? 'active' : 'revoked'),
            'note' => $grant?->note ?? '',
            'source' => $grant ? ($viaRole ? 'role+grant' : 'grant') : 'role',
        ];
    }
}
