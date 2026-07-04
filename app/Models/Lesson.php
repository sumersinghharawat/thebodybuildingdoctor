<?php

namespace App\Models;

use App\Services\ContentProtectionService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lesson extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'course_id',
        'title',
        'slug',
        'sort_order',
        'duration_sec',
        'video_url',
        'content_html',
        'free_preview',
        'thumbnail_url',
        'pdf_url',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'duration_sec' => 'integer',
            'free_preview' => 'boolean',
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function toPublicArray(): array
    {
        return $this->toAdminArray();
    }

    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'courseId' => $this->course_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'order' => $this->sort_order,
            'durationSec' => $this->duration_sec,
            'videoUrl' => $this->video_url,
            'contentHtml' => $this->content_html,
            'freePreview' => $this->free_preview,
            'thumbnailUrl' => $this->thumbnail_url,
            'pdfUrl' => $this->pdf_url,
        ];
    }

    public function toLearnerArray(bool $includeVideo = false): array
    {
        $data = $this->toAdminArray();
        $data['contentHtml'] = ContentProtectionService::sanitizeHtml($data['contentHtml']);
        $data['hasVideo'] = trim((string) $this->video_url) !== '';
        $data['hasEmbeddedVideo'] = ContentProtectionService::htmlHasEmbeddableVideo($this->content_html);

        if ($includeVideo) {
            $data['videoUrl'] = ContentProtectionService::publicVideoUrl($this->video_url);
        } else {
            unset($data['videoUrl']);
        }

        return $data;
    }
}
