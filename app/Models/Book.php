<?php

namespace App\Models;

use App\Support\MediaUrl;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Book extends Model
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
        'pdf_path',
        'price_cents',
        'published',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'price_cents' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(BookPurchase::class);
    }

    public function hasPdf(): bool
    {
        $path = trim((string) $this->pdf_path);

        return $path !== '' && Storage::disk('local')->exists($path);
    }

    public function toPublicArray(bool $hasAccess = false, ?string $accessStatus = null): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'descriptionHtml' => $this->description_html,
            'thumbnailUrl' => MediaUrl::resolve($this->thumbnail_url) ?? '',
            'priceCents' => $this->price_cents,
            'published' => $this->published,
            'order' => $this->sort_order,
            'hasPdf' => $this->hasPdf(),
            'hasAccess' => $hasAccess,
            'accessStatus' => $accessStatus,
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
            'pdfPath' => $this->pdf_path,
            'hasPdf' => $this->hasPdf(),
            'priceCents' => $this->price_cents,
            'published' => $this->published,
            'order' => $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
