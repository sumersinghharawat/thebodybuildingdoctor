<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogAccess extends Model
{
    protected $table = 'blog_access';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'granted_at',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'granted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toPublicArray(): array
    {
        return [
            'uid' => $this->user_id,
            'grantedAt' => $this->granted_at?->toISOString(),
            'status' => $this->status,
            'note' => $this->note ?? '',
        ];
    }
}
