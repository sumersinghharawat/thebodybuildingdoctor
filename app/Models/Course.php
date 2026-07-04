<?php

namespace App\Models;

use App\Services\ContentProtectionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
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
        'pdf_url',
        'video_url',
        'instructor_name',
        'level',
        'category',
        'published',
        'price_cents',
        'lesson_count',
        'total_duration_sec',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'published' => 'boolean',
            'price_cents' => 'integer',
            'lesson_count' => 'integer',
            'total_duration_sec' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('sort_order');
    }

    public function toPublicArray(): array
    {
        $data = $this->toAdminArray();
        $data['descriptionHtml'] = ContentProtectionService::sanitizeHtml($data['descriptionHtml']);
        $data['videoUrl'] = ContentProtectionService::publicVideoUrl($this->video_url);
        $data['hasVideo'] = trim((string) $this->video_url) !== '';
        $data['hasEmbeddedVideo'] = ContentProtectionService::htmlHasEmbeddableVideo($this->description_html);

        return $data;
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'descriptionHtml' => $this->description_html,
            'thumbnailUrl' => $this->thumbnail_url,
            'pdfUrl' => $this->pdf_url,
            'videoUrl' => $this->video_url,
            'instructorName' => $this->instructor_name,
            'level' => $this->level,
            'category' => $this->category,
            'published' => $this->published,
            'priceCents' => $this->price_cents,
            'lessonCount' => $this->lesson_count,
            'totalDurationSec' => $this->total_duration_sec,
            'order' => $this->sort_order,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
