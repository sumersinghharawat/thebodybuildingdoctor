<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VaultPurchase extends Model
{
    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = [
        'user_id',
        'vault_video_id',
        'requested_at',
        'granted_at',
        'source',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'granted_at' => 'datetime',
        ];
    }

    /**
     * Composite primary key: user_id + vault_video_id (no single `id` column).
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('user_id', $this->getAttribute('user_id'))
            ->where('vault_video_id', $this->getAttribute('vault_video_id'));
    }

    protected function setKeysForSelectQuery($query)
    {
        return $this->setKeysForSaveQuery($query);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function video(): BelongsTo
    {
        return $this->belongsTo(VaultVideo::class, 'vault_video_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function toPublicArray(): array
    {
        return [
            'uid' => $this->user_id,
            'videoId' => $this->vault_video_id,
            'requestedAt' => $this->requested_at?->toISOString(),
            'grantedAt' => $this->granted_at?->toISOString(),
            'source' => $this->source,
            'status' => $this->status,
            'note' => $this->note,
        ];
    }
}
