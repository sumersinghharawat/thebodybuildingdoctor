<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VaultVideo extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'slug',
        'description',
        'description_html',
        'thumbnail_url',
        'video_url',
        'price_cents',
        'preview_seconds',
        'published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'price_cents' => 'integer',
            'preview_seconds' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(VaultPurchase::class);
    }

    public function isFree(): bool
    {
        return $this->price_cents <= 0;
    }

    public function toPublicArray(bool $hasAccess = false, ?string $accessStatus = null, bool $includePlayback = false): array
    {
        $free = $this->isFree();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'descriptionHtml' => $this->description_html,
            'thumbnailUrl' => MediaUrl::card($this->thumbnail_url),
            'videoUrl' => $includePlayback ? (MediaUrl::resolve($this->video_url) ?? '') : '',
            'priceCents' => $this->price_cents,
            'previewSeconds' => $this->preview_seconds ?: 30,
            'published' => $this->published,
            'order' => $this->sort_order,
            'hasAccess' => $hasAccess || $free,
            'accessStatus' => $free ? 'active' : $accessStatus,
            'isFree' => $free,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'descriptionHtml' => $this->description_html,
            'thumbnailUrl' => MediaUrl::resolve($this->thumbnail_url) ?? '',
            'videoUrl' => $this->video_url,
            'priceCents' => $this->price_cents,
            'previewSeconds' => $this->preview_seconds ?: 30,
            'published' => $this->published,
            'order' => $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
