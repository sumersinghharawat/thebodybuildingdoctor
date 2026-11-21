<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

class LearnPaths
{
    #[OA\Get(
        path: '/learn/courses',
        operationId: 'learnCourses',
        summary: 'List enrolled and browse courses',
        security: [['sanctum' => []]],
        tags: ['Learn'],
        responses: [
            new OA\Response(response: 200, description: 'Course lists', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'enrolledCourses', type: 'array', items: new OA\Items(ref: '#/components/schemas/CoursePublic')),
                new OA\Property(property: 'browseCourses', type: 'array', items: new OA\Items(ref: '#/components/schemas/CoursePublic')),
            ])),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'No app access'),
        ]
    )]
    public function courses(): void {}

    #[OA\Get(
        path: '/learn/courses/{courseId}',
        operationId: 'learnShowCourse',
        summary: 'Course detail with lesson list',
        security: [['sanctum' => []]],
        tags: ['Learn'],
        parameters: [new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [
            new OA\Response(response: 200, description: 'Course and lessons', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'course', ref: '#/components/schemas/CoursePublic'),
                new OA\Property(property: 'enrolled', type: 'boolean'),
                new OA\Property(property: 'lessons', type: 'array', items: new OA\Items(ref: '#/components/schemas/LessonLearner')),
            ])),
            new OA\Response(response: 404, description: 'Course not found'),
        ]
    )]
    public function showCourse(): void {}

    #[OA\Get(
        path: '/learn/courses/{courseId}/lessons/{lessonId}',
        operationId: 'learnShowLesson',
        summary: 'Lesson detail with prev/next navigation',
        security: [['sanctum' => []]],
        tags: ['Learn'],
        parameters: [
            new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'lessonId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Lesson detail'),
            new OA\Response(response: 403, description: 'Enrollment required'),
            new OA\Response(response: 404, description: 'Not found'),
        ]
    )]
    public function showLesson(): void {}

    #[OA\Get(
        path: '/learn/courses/{courseId}/playback',
        operationId: 'learnCoursePlayback',
        summary: 'Course-level video playback info',
        security: [['sanctum' => []]],
        tags: ['Learn'],
        parameters: [new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [
            new OA\Response(response: 200, description: 'Playback payload', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'playback', ref: '#/components/schemas/Playback'),
            ])),
            new OA\Response(response: 404, description: 'Video unavailable'),
        ]
    )]
    public function coursePlayback(): void {}

    #[OA\Get(
        path: '/learn/courses/{courseId}/lessons/{lessonId}/playback',
        operationId: 'learnLessonPlayback',
        summary: 'Lesson video playback info',
        security: [['sanctum' => []]],
        tags: ['Learn'],
        parameters: [
            new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'lessonId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Playback payload', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'playback', ref: '#/components/schemas/Playback'),
            ])),
            new OA\Response(response: 403, description: 'Enrollment required'),
            new OA\Response(response: 404, description: 'Video unavailable'),
        ]
    )]
    public function lessonPlayback(): void {}

    #[OA\Get(
        path: '/learn/courses/{courseId}/lessons/{lessonId}/stream',
        operationId: 'learnLessonStream',
        summary: 'Redirect to hosted video file (signed URL or bearer token)',
        tags: ['Learn'],
        parameters: [
            new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'lessonId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'signature', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(response: 302, description: 'Redirect to video URL'),
            new OA\Response(response: 401, description: 'Unauthorized'),
            new OA\Response(response: 403, description: 'Enrollment required'),
        ]
    )]
    public function stream(): void {}

    #[OA\Get(
        path: '/mentorship',
        operationId: 'mentorshipIndex',
        summary: 'List published mentorship articles',
        security: [['sanctum' => []]],
        tags: ['Mentorship'],
        responses: [
            new OA\Response(response: 200, description: 'Mentorship list', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'mentorship', type: 'array', items: new OA\Items(ref: '#/components/schemas/MentorshipPublic')),
            ])),
        ]
    )]
    public function mentorship(): void {}

    #[OA\Get(
        path: '/mentorship/{id}/playback',
        operationId: 'mentorshipPlayback',
        summary: 'Mentorship article video playback info',
        security: [['sanctum' => []]],
        tags: ['Mentorship'],
        parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))],
        responses: [
            new OA\Response(response: 200, description: 'Playback payload', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'playback', ref: '#/components/schemas/Playback'),
            ])),
            new OA\Response(response: 404, description: 'Video unavailable'),
        ]
    )]
    public function mentorshipPlayback(): void {}
}
