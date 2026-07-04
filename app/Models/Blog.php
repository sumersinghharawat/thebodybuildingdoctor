<?php

namespace App\Models;

use App\Services\ContentProtectionService;
use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'title',
        'slug',
        'excerpt',
        'content_html',
        'thumbnail_url',
        'pdf_url',
        'video_url',
        'author_name',
        'published',
        'published_at',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'published_at' => 'datetime',
            'sort_order' => 'integer',
        ];
    }

    public function toPublicArray(): array
    {
        $data = $this->toAdminArray();
        $data['contentHtml'] = ContentProtectionService::sanitizeHtml($data['contentHtml']);
        $data['videoUrl'] = ContentProtectionService::publicVideoUrl($this->video_url);
        $data['hasVideo'] = trim((string) $this->video_url) !== '';
        $data['hasEmbeddedVideo'] = ContentProtectionService::htmlHasEmbeddableVideo($this->content_html);

        return $data;
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'contentHtml' => $this->content_html,
            'thumbnailUrl' => $this->thumbnail_url,
            'pdfUrl' => $this->pdf_url,
            'videoUrl' => $this->video_url,
            'authorName' => $this->author_name,
            'published' => $this->published,
            'publishedAt' => $this->published_at?->toISOString(),
            'order' => $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
