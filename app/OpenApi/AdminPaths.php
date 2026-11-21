<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

class AdminPaths
{
    #[OA\Get(path: '/admin/courses', operationId: 'adminCoursesIndex', summary: 'List all courses', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Course list')])]
    public function coursesIndex(): void {}

    #[OA\Post(path: '/admin/courses', operationId: 'adminCoursesStore', summary: 'Create course', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function coursesStore(): void {}

    #[OA\Get(path: '/admin/courses/{id}', operationId: 'adminCoursesShow', summary: 'Get course with lessons', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Course detail')])]
    public function coursesShow(): void {}

    #[OA\Patch(path: '/admin/courses/{id}', operationId: 'adminCoursesUpdate', summary: 'Update course', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function coursesUpdate(): void {}

    #[OA\Delete(path: '/admin/courses/{id}', operationId: 'adminCoursesDestroy', summary: 'Delete course', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function coursesDestroy(): void {}

    #[OA\Post(path: '/admin/courses/{courseId}/lessons', operationId: 'adminLessonsStore', summary: 'Create lesson', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function lessonsStore(): void {}

    #[OA\Patch(path: '/admin/courses/{courseId}/lessons/reorder', operationId: 'adminLessonsReorder', summary: 'Reorder lessons', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Reordered')])]
    public function lessonsReorder(): void {}

    #[OA\Patch(path: '/admin/courses/{courseId}/lessons/{lessonId}', operationId: 'adminLessonsUpdate', summary: 'Update lesson', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'lessonId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function lessonsUpdate(): void {}

    #[OA\Delete(path: '/admin/courses/{courseId}/lessons/{lessonId}', operationId: 'adminLessonsDestroy', summary: 'Delete lesson', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'lessonId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function lessonsDestroy(): void {}

    #[OA\Get(path: '/admin/enrollments', operationId: 'adminEnrollmentsIndex', summary: 'List enrollments', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'uid', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'courseId', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Enrollment list')])]
    public function enrollmentsIndex(): void {}

    #[OA\Post(path: '/admin/enrollments', operationId: 'adminEnrollmentsStore', summary: 'Create enrollment', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function enrollmentsStore(): void {}

    #[OA\Get(path: '/admin/enrollments/{uid}/{courseId}', operationId: 'adminEnrollmentsShow', summary: 'Get enrollment', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Enrollment detail')])]
    public function enrollmentsShow(): void {}

    #[OA\Patch(path: '/admin/enrollments/{uid}/{courseId}', operationId: 'adminEnrollmentsUpdate', summary: 'Update enrollment', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function enrollmentsUpdate(): void {}

    #[OA\Delete(path: '/admin/enrollments/{uid}/{courseId}', operationId: 'adminEnrollmentsDestroy', summary: 'Delete enrollment', security: [['sanctum' => []]], tags: ['Admin'], parameters: [
        new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
        new OA\Parameter(name: 'courseId', in: 'path', required: true, schema: new OA\Schema(type: 'string')),
    ], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function enrollmentsDestroy(): void {}

    #[OA\Get(path: '/admin/mentorship', operationId: 'adminMentorshipIndex', summary: 'List mentorship articles', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Mentorship list')])]
    public function mentorshipIndex(): void {}

    #[OA\Post(path: '/admin/mentorship', operationId: 'adminMentorshipStore', summary: 'Create mentorship article', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function mentorshipStore(): void {}

    #[OA\Get(path: '/admin/mentorship/{id}', operationId: 'adminMentorshipShow', summary: 'Get mentorship article', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Mentorship detail')])]
    public function mentorshipShow(): void {}

    #[OA\Patch(path: '/admin/mentorship/{id}', operationId: 'adminMentorshipUpdate', summary: 'Update mentorship article', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function mentorshipUpdate(): void {}

    #[OA\Delete(path: '/admin/mentorship/{id}', operationId: 'adminMentorshipDestroy', summary: 'Delete mentorship article', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function mentorshipDestroy(): void {}

    #[OA\Get(path: '/admin/users', operationId: 'adminUsersIndex', summary: 'List users', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'User list')])]
    public function usersIndex(): void {}

    #[OA\Post(path: '/admin/users', operationId: 'adminUsersStore', summary: 'Create user', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function usersStore(): void {}

    #[OA\Get(path: '/admin/users/{uid}', operationId: 'adminUsersShow', summary: 'Get user', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'User detail')])]
    public function usersShow(): void {}

    #[OA\Patch(path: '/admin/users/{uid}', operationId: 'adminUsersUpdate', summary: 'Update user', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function usersUpdate(): void {}

    #[OA\Delete(path: '/admin/users/{uid}', operationId: 'adminUsersDestroy', summary: 'Delete user', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function usersDestroy(): void {}

    #[OA\Get(path: '/admin/inquiries', operationId: 'adminInquiriesIndex', summary: 'List inquiries', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Inquiry list')])]
    public function inquiriesIndex(): void {}

    #[OA\Patch(path: '/admin/inquiries/{id}', operationId: 'adminInquiriesUpdate', summary: 'Update inquiry status', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function inquiriesUpdate(): void {}

    #[OA\Get(path: '/admin/mentorship-access', operationId: 'adminMentorshipAccessIndex', summary: 'List mentorship access grants', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Access list')])]
    public function mentorshipAccessIndex(): void {}

    #[OA\Post(path: '/admin/mentorship-access', operationId: 'adminMentorshipAccessStore', summary: 'Grant mentorship access', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 201, description: 'Created')])]
    public function mentorshipAccessStore(): void {}

    #[OA\Get(path: '/admin/mentorship-access/{uid}', operationId: 'adminMentorshipAccessShow', summary: 'Get mentorship access', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Access detail')])]
    public function mentorshipAccessShow(): void {}

    #[OA\Patch(path: '/admin/mentorship-access/{uid}', operationId: 'adminMentorshipAccessUpdate', summary: 'Update mentorship access', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function mentorshipAccessUpdate(): void {}

    #[OA\Delete(path: '/admin/mentorship-access/{uid}', operationId: 'adminMentorshipAccessDestroy', summary: 'Revoke mentorship access', security: [['sanctum' => []]], tags: ['Admin'], parameters: [new OA\Parameter(name: 'uid', in: 'path', required: true, schema: new OA\Schema(type: 'string'))], responses: [new OA\Response(response: 200, description: 'Deleted', content: new OA\JsonContent(ref: '#/components/schemas/SuccessResponse'))])]
    public function mentorshipAccessDestroy(): void {}

    #[OA\Get(path: '/admin/landing-app', operationId: 'adminLandingAppShow', summary: 'Get landing app section settings', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Settings')])]
    public function landingAppShow(): void {}

    #[OA\Patch(path: '/admin/landing-app', operationId: 'adminLandingAppUpdate', summary: 'Update landing app section', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function landingAppUpdate(): void {}

    #[OA\Get(path: '/admin/settings', operationId: 'adminSettingsShow', summary: 'Get general settings', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Settings')])]
    public function settingsShow(): void {}

    #[OA\Patch(path: '/admin/settings', operationId: 'adminSettingsUpdate', summary: 'Update general settings', security: [['sanctum' => []]], tags: ['Admin'], responses: [new OA\Response(response: 200, description: 'Updated')])]
    public function settingsUpdate(): void {}

    #[OA\Post(path: '/admin/upload', operationId: 'adminUpload', summary: 'Upload image, PDF, or APK', security: [['sanctum' => []]], tags: ['Admin'], requestBody: new OA\RequestBody(required: true, content: new OA\MediaType(mediaType: 'multipart/form-data', schema: new OA\Schema(required: ['file', 'folder'], properties: [
        new OA\Property(property: 'file', type: 'string', format: 'binary'),
        new OA\Property(property: 'folder', type: 'string', enum: ['courses', 'mentorship', 'blogs', 'marketing', 'documents', 'apps']),
    ]))), responses: [new OA\Response(response: 200, description: 'Upload URL returned')])]
    public function upload(): void {}
}
