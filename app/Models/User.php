<?php

namespace App\Models;

use App\Support\Roles;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passkeys\Contracts\PasskeyUser;
use Laravel\Passkeys\PasskeyAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, Notifiable, PasskeyAuthenticatable;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'email',
        'password',
        'roles',
        'photo_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'face_descriptor',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'face_registered_at' => 'datetime',
            'password' => 'hashed',
            'roles' => 'array',
        ];
    }

    public function roleList(): array
    {
        return Roles::parse($this->roles);
    }

    public function hasAppAccess(): bool
    {
        return Roles::hasAppAccess($this->roleList());
    }

    public function isAdmin(): bool
    {
        return Roles::isAdmin($this->roleList());
    }

    public function hasFaceRegistered(): bool
    {
        return filled($this->face_descriptor) && $this->face_registered_at !== null;
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function toSessionArray(): array
    {
        $roles = $this->roleList();

        return [
            'uid' => $this->id,
            'id' => 0,
            'email' => $this->email,
            'name' => $this->name,
            'username' => $this->email,
            'roles' => $roles,
            'role' => Roles::primary($roles),
        ];
    }
}
