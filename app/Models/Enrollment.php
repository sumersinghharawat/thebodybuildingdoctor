<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model
{
    public $incrementing = false;

    protected $primaryKey = null;

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

    /**
     * Composite primary key: user_id + course_id (no single `id` column).
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('user_id', $this->getAttribute('user_id'))
            ->where('course_id', $this->getAttribute('course_id'));
    }

    protected function setKeysForSelectQuery($query)
    {
        return $this->setKeysForSaveQuery($query);
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
