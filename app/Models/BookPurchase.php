<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookPurchase extends Model
{
    public $incrementing = false;

    protected $primaryKey = null;

    protected $fillable = [
        'user_id',
        'book_id',
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
     * Composite primary key: user_id + book_id (no single `id` column).
     */
    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('user_id', $this->getAttribute('user_id'))
            ->where('book_id', $this->getAttribute('book_id'));
    }

    protected function setKeysForSelectQuery($query)
    {
        return $this->setKeysForSaveQuery($query);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function toPublicArray(): array
    {
        return [
            'uid' => $this->user_id,
            'bookId' => $this->book_id,
            'requestedAt' => $this->requested_at?->toISOString(),
            'grantedAt' => $this->granted_at?->toISOString(),
            'source' => $this->source,
            'status' => $this->status,
            'note' => $this->note,
        ];
    }
}
