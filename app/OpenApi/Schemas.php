<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Schema(schema: 'UserSession', properties: [
    new OA\Property(property: 'uid', type: 'string'),
    new OA\Property(property: 'id', type: 'integer'),
    new OA\Property(property: 'email', type: 'string', format: 'email'),
    new OA\Property(property: 'name', type: 'string'),
    new OA\Property(property: 'username', type: 'string'),
    new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'string')),
    new OA\Property(property: 'role', type: 'string'),
])]
#[OA\Schema(schema: 'CoursePublic', properties: [
    new OA\Property(property: 'id', type: 'string'),
    new OA\Property(property: 'title', type: 'string'),
    new OA\Property(property: 'slug', type: 'string'),
    new OA\Property(property: 'description', type: 'string'),
    new OA\Property(property: 'descriptionHtml', type: 'string', nullable: true),
    new OA\Property(property: 'thumbnailUrl', type: 'string'),
    new OA\Property(property: 'instructorName', type: 'string'),
    new OA\Property(property: 'level', type: 'string'),
    new OA\Property(property: 'category', type: 'string'),
    new OA\Property(property: 'published', type: 'boolean'),
    new OA\Property(property: 'priceCents', type: 'integer'),
    new OA\Property(property: 'lessonCount', type: 'integer'),
    new OA\Property(property: 'totalDurationSec', type: 'integer'),
    new OA\Property(property: 'hasVideo', type: 'boolean'),
    new OA\Property(property: 'hasEmbeddedVideo', type: 'boolean'),
])]
#[OA\Schema(schema: 'LessonLearner', properties: [
    new OA\Property(property: 'id', type: 'string'),
    new OA\Property(property: 'courseId', type: 'string'),
    new OA\Property(property: 'title', type: 'string'),
    new OA\Property(property: 'order', type: 'integer'),
    new OA\Property(property: 'durationSec', type: 'integer'),
    new OA\Property(property: 'contentHtml', type: 'string', nullable: true),
    new OA\Property(property: 'freePreview', type: 'boolean'),
    new OA\Property(property: 'thumbnailUrl', type: 'string', nullable: true),
    new OA\Property(property: 'locked', type: 'boolean'),
    new OA\Property(property: 'hasVideo', type: 'boolean'),
    new OA\Property(property: 'hasEmbeddedVideo', type: 'boolean'),
])]
#[OA\Schema(schema: 'MentorshipPublic', properties: [
    new OA\Property(property: 'id', type: 'string'),
    new OA\Property(property: 'title', type: 'string'),
    new OA\Property(property: 'slug', type: 'string'),
    new OA\Property(property: 'excerpt', type: 'string'),
    new OA\Property(property: 'contentHtml', type: 'string'),
    new OA\Property(property: 'thumbnailUrl', type: 'string'),
    new OA\Property(property: 'authorName', type: 'string'),
    new OA\Property(property: 'published', type: 'boolean'),
    new OA\Property(property: 'hasVideo', type: 'boolean'),
    new OA\Property(property: 'hasEmbeddedVideo', type: 'boolean'),
])]
#[OA\Schema(schema: 'Playback', properties: [
    new OA\Property(property: 'provider', type: 'string', example: 'youtube'),
    new OA\Property(property: 'playbackUrl', type: 'string'),
    new OA\Property(property: 'embedUrl', type: 'string', nullable: true),
    new OA\Property(property: 'videoId', type: 'string', nullable: true),
])]
#[OA\Schema(schema: 'InquiryPublic', properties: [
    new OA\Property(property: 'id', type: 'string'),
    new OA\Property(property: 'name', type: 'string'),
    new OA\Property(property: 'email', type: 'string', format: 'email'),
    new OA\Property(property: 'type', type: 'string', enum: ['mentorship', 'courses', 'both']),
    new OA\Property(property: 'status', type: 'string'),
    new OA\Property(property: 'courseId', type: 'string', nullable: true),
    new OA\Property(property: 'courseTitle', type: 'string', nullable: true),
])]
#[OA\Schema(schema: 'SuccessResponse', properties: [
    new OA\Property(property: 'success', type: 'boolean', example: true),
])]
#[OA\Schema(schema: 'MessageResponse', properties: [
    new OA\Property(property: 'message', type: 'string'),
])]
class Schemas
{
}
