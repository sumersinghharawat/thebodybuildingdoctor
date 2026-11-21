<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'The Bodybuilding Doctor API',
    description: 'REST API for the mobile app (Sanctum bearer token) and admin dashboard.',
)]
#[OA\Server(url: '/api', description: 'API base path')]
#[OA\SecurityScheme(
    securityScheme: 'sanctum',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum',
    description: 'Token returned by POST /auth/login. Send as `Authorization: Bearer {token}`.',
)]
#[OA\Tag(name: 'Auth', description: 'Authentication')]
#[OA\Tag(name: 'Learn', description: 'Courses and lessons (requires app access)')]
#[OA\Tag(name: 'Mentorship', description: 'Mentorship articles (requires app access)')]
#[OA\Tag(name: 'Inquiries', description: 'Public inquiry / course access requests')]
#[OA\Tag(name: 'Admin', description: 'Admin CRUD (requires administrator role)')]
class OpenApi
{
}
