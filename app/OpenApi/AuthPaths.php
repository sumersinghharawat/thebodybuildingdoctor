<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

class AuthPaths
{
    #[OA\Post(
        path: '/auth/login',
        operationId: 'authLogin',
        summary: 'Login and receive a Sanctum token',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['email', 'password'], properties: [
            new OA\Property(property: 'email', type: 'string', format: 'email'),
            new OA\Property(property: 'password', type: 'string', format: 'password'),
            new OA\Property(property: 'device_name', type: 'string', nullable: true, example: 'iphone'),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Authenticated', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'user', ref: '#/components/schemas/UserSession'),
            ])),
            new OA\Response(response: 422, description: 'Invalid credentials or no app access'),
        ]
    )]
    public function login(): void {}

    #[OA\Post(
        path: '/auth/forgot-password',
        operationId: 'authForgotPassword',
        summary: 'Send password reset email',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(required: true, content: new OA\JsonContent(required: ['email'], properties: [
            new OA\Property(property: 'email', type: 'string', format: 'email'),
        ])),
        responses: [
            new OA\Response(response: 200, description: 'Reset link sent', content: new OA\JsonContent(ref: '#/components/schemas/MessageResponse')),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function forgotPassword(): void {}

    #[OA\Get(
        path: '/auth/me',
        operationId: 'authMe',
        summary: 'Current authenticated user',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'User profile', content: new OA\JsonContent(properties: [
                new OA\Property(property: 'user', ref: '#/components/schemas/UserSession'),
            ])),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function me(): void {}

    #[OA\Post(
        path: '/auth/logout',
        operationId: 'authLogout',
        summary: 'Revoke current access token',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Logged out', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse')),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function logout(): void {}
}
