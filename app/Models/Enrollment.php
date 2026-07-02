<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id',
        'course_id',
        'enrolled_at',
        'source',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'enrolled_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function toPublicArray(): array
    {
        return [
            'uid' => $this->user_id,
            'courseId' => $this->course_id,
            'enrolledAt' => $this->enrolled_at?->toISOString(),
            'source' => $this->source,
            'status' => $this->status,
            'expiresAt' => $this->expires_at?->toISOString(),
        ];
    }
}
