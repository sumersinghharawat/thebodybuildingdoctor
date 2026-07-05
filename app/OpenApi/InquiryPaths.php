<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

class InquiryPaths
{
    #[OA\Post(
        path: '/inquiries',
        operationId: 'inquiriesStore',
        summary: 'Submit a course or mentorship inquiry',
        tags: ['Inquiries'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['name', 'email', 'type'], properties: [
            new OA\Property(property: 'name', type: 'string', maxLength: 120),
            new OA\Property(property: 'email', type: 'string', format: 'email'),
            new OA\Property(property: 'phone', type: 'string', nullable: true),
            new OA\Property(property: 'type', type: 'string', enum: ['mentorship', 'courses', 'both']),
            new OA\Property(property: 'courseId', type: 'string', nullable: true),
            new OA\Property(property: 'courseTitle', type: 'string', nullable: true),
            new OA\Property(property: 'message', type: 'string', nullable: true),
        ])),
        responses: [
            new OA\Response(response: 201, description: 'Inquiry created', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'inquiry', ref: '#/components/schemas/InquiryPublic'),
            ])),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(): void {}
}
