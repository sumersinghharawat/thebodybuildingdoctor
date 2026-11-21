<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketReply extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'support_ticket_id',
        'user_id',
        'body',
        'is_admin',
    ];

    protected function casts(): array
    {
        return [
            'is_admin' => 'boolean',
        ];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'isAdmin' => $this->is_admin,
            'authorName' => $this->relationLoaded('user') ? ($this->user?->name ?? 'Support') : 'Support',
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
