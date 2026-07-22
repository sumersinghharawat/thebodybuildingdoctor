<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\Admin\AdminPageController;
use App\Http\Controllers\Web\CalculatorPageController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\CourseRequestController;
use App\Http\Controllers\Web\CoursesPageController;
use App\Http\Controllers\Web\LandingController;
use App\Http\Controllers\Web\LearnPageController;
use App\Http\Controllers\Web\MentorshipPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');
Route::get('/download/android', App\Http\Controllers\Web\AppDownloadController::class)->name('app.download');
Route::get('/courses', CoursesPageController::class)->name('courses.index');
Route::post('/inquiries', [LandingController::class, 'storeInquiry'])->name('inquiries.store');

Route::middleware(['auth', 'app.access'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/calculator', CalculatorPageController::class)->name('calculator');
    Route::get('/mentorship/{id}/embed/{slot}/playback', [MentorshipPageController::class, 'embedPlayback'])->name('mentorship.embed.playback');
    Route::get('/mentorship/{id}/playback', [MentorshipPageController::class, 'playback'])->name('mentorship.playback');
    Route::get('/mentorship/{slug}', [MentorshipPageController::class, 'show'])->name('mentorship.show');

    Route::get('/learn', [LearnPageController::class, 'index'])->name('learn.index');
    Route::get('/learn/courses/{courseId}', [LearnPageController::class, 'showCourse'])->name('learn.courses.show');
    Route::post('/learn/courses/{courseId}/request', [CourseRequestController::class, 'store'])->name('learn.courses.request');
    Route::get('/learn/courses/{courseId}/playback', [LearnPageController::class, 'coursePlayback'])->name('learn.courses.playback');
    Route::get('/learn/courses/{courseId}/embed/{slot}/playback', [LearnPageController::class, 'courseEmbedPlayback'])->name('learn.courses.embed.playback');
    Route::get('/learn/courses/{courseId}/lessons/{lessonId}', [LearnPageController::class, 'showLesson'])->name('learn.lessons.show');
    Route::get('/learn/courses/{courseId}/lessons/{lessonId}/playback', [LearnPageController::class, 'lessonPlayback'])->name('learn.lessons.playback');
    Route::get('/learn/courses/{courseId}/lessons/{lessonId}/embed/{slot}/playback', [LearnPageController::class, 'lessonEmbedPlayback'])->name('learn.lessons.embed.playback');
});

Route::middleware(['auth', 'admin'])->prefix('dashboard')->name('admin.')->group(function () {
    Route::get('/courses', [AdminPageController::class, 'coursesIndex'])->name('courses.index');
    Route::get('/courses/new', [AdminPageController::class, 'coursesCreate'])->name('courses.create');
    Route::get('/courses/{id}', [AdminPageController::class, 'coursesShow'])->name('courses.show');
    Route::get('/courses/{id}/edit', [AdminPageController::class, 'coursesEdit'])->name('courses.edit');

    Route::get('/inquiries', [AdminPageController::class, 'inquiriesIndex'])->name('inquiries.index');

    Route::get('/enrollments', [AdminPageController::class, 'enrollmentsIndex'])->name('enrollments.index');
    Route::get('/enrollments/new', [AdminPageController::class, 'enrollmentsCreate'])->name('enrollments.create');
    Route::get('/enrollments/{uid}/{courseId}', [AdminPageController::class, 'enrollmentsEdit'])->name('enrollments.edit');

    Route::get('/mentorship', [AdminPageController::class, 'mentorshipIndex'])->name('mentorship.index');
    Route::get('/mentorship/new', [AdminPageController::class, 'mentorshipCreate'])->name('mentorship.create');
    Route::get('/mentorship/{id}/edit', [AdminPageController::class, 'mentorshipEdit'])->name('mentorship.edit');

    Route::get('/mentorship-access', [AdminPageController::class, 'mentorshipAccessIndex'])->name('mentorship-access.index');
    Route::get('/mentorship-access/new', [AdminPageController::class, 'mentorshipAccessCreate'])->name('mentorship-access.create');
    Route::get('/mentorship-access/{uid}/edit', [AdminPageController::class, 'mentorshipAccessEdit'])->name('mentorship-access.edit');

    Route::get('/users', [AdminPageController::class, 'usersIndex'])->name('users.index');
    Route::get('/users/new', [AdminPageController::class, 'usersCreate'])->name('users.create');
    Route::get('/users/{uid}/edit', [AdminPageController::class, 'usersEdit'])->name('users.edit');

    Route::get('/landing-app', [AdminPageController::class, 'landingAppSection'])->name('landing-app.edit');
    Route::get('/settings', [AdminPageController::class, 'generalSettings'])->name('settings.edit');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::redirect('/articles/{slug}', '/mentorship/{slug}');
Route::redirect('/dashboard/blogs', '/dashboard/mentorship');
Route::redirect('/dashboard/blogs/new', '/dashboard/mentorship/new');
Route::redirect('/dashboard/blog-access', '/dashboard/mentorship-access');
Route::redirect('/dashboard/blog-access/new', '/dashboard/mentorship-access/new');

require __DIR__.'/auth.php';
