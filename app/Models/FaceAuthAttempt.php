<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FaceAuthAttempt extends Model
{
    public const TYPE_LOGIN = 'login';

    public const TYPE_ENROLL = 'enroll';

    public const STATUS_SUCCESS = 'success';

    public const STATUS_FAILED = 'failed';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'reason',
        'match_distance',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'match_distance' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
