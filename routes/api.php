<?php

use App\Http\Controllers\Api\Admin\BlogAccessController;
use App\Http\Controllers\Api\Admin\BlogController;
use App\Http\Controllers\Api\Admin\CourseController;
use App\Http\Controllers\Api\Admin\EnrollmentController;
use App\Http\Controllers\Api\Admin\InquiryAdminController;
use App\Http\Controllers\Api\Admin\LessonController;
use App\Http\Controllers\Api\Admin\SiteSettingsController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InquiryController;
use App\Http\Controllers\Api\LearnController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/inquiries', [InquiryController::class, 'store']);

Route::get('/learn/courses/{courseId}/lessons/{lessonId}/stream', [LearnController::class, 'stream'])
    ->name('learn.stream');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::middleware('app.access')->group(function () {
        Route::get('/learn/courses', [LearnController::class, 'courses']);
        Route::get('/learn/courses/{courseId}', [LearnController::class, 'showCourse']);
        Route::get('/learn/courses/{courseId}/lessons/{lessonId}', [LearnController::class, 'showLesson']);
        Route::get('/learn/courses/{courseId}/lessons/{lessonId}/playback', [LearnController::class, 'playback']);
        Route::get('/mentorship', [LearnController::class, 'mentorship']);
    });

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/courses', [CourseController::class, 'index']);
        Route::post('/courses', [CourseController::class, 'store']);
        Route::get('/courses/{id}', [CourseController::class, 'show']);
        Route::patch('/courses/{id}', [CourseController::class, 'update']);
        Route::delete('/courses/{id}', [CourseController::class, 'destroy']);

        Route::post('/courses/{courseId}/lessons', [LessonController::class, 'store']);
        Route::patch('/courses/{courseId}/lessons/reorder', [LessonController::class, 'reorder']);
        Route::patch('/courses/{courseId}/lessons/{lessonId}', [LessonController::class, 'update']);
        Route::delete('/courses/{courseId}/lessons/{lessonId}', [LessonController::class, 'destroy']);

        Route::get('/enrollments', [EnrollmentController::class, 'index']);
        Route::post('/enrollments', [EnrollmentController::class, 'store']);
        Route::get('/enrollments/{uid}/{courseId}', [EnrollmentController::class, 'show']);
        Route::patch('/enrollments/{uid}/{courseId}', [EnrollmentController::class, 'update']);
        Route::delete('/enrollments/{uid}/{courseId}', [EnrollmentController::class, 'destroy']);

        Route::get('/mentorship', [BlogController::class, 'index']);
        Route::post('/mentorship', [BlogController::class, 'store']);
        Route::get('/mentorship/{id}', [BlogController::class, 'show']);
        Route::patch('/mentorship/{id}', [BlogController::class, 'update']);
        Route::delete('/mentorship/{id}', [BlogController::class, 'destroy']);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{uid}', [UserController::class, 'show']);
        Route::patch('/users/{uid}', [UserController::class, 'update']);
        Route::delete('/users/{uid}', [UserController::class, 'destroy']);

        Route::get('/inquiries', [InquiryAdminController::class, 'index']);
        Route::patch('/inquiries/{id}', [InquiryAdminController::class, 'update']);

        Route::get('/mentorship-access', [BlogAccessController::class, 'index']);
        Route::post('/mentorship-access', [BlogAccessController::class, 'store']);
        Route::get('/mentorship-access/{uid}', [BlogAccessController::class, 'show']);
        Route::patch('/mentorship-access/{uid}', [BlogAccessController::class, 'update']);
        Route::delete('/mentorship-access/{uid}', [BlogAccessController::class, 'destroy']);

        Route::get('/landing-app', [SiteSettingsController::class, 'showLandingApp']);
        Route::patch('/landing-app', [SiteSettingsController::class, 'updateLandingApp']);

        Route::get('/settings', [SiteSettingsController::class, 'showGeneral']);
        Route::patch('/settings', [SiteSettingsController::class, 'updateGeneral']);

        Route::post('/upload', [UploadController::class, 'store']);
    });
});
