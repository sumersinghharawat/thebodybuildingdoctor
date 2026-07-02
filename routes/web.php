<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\Admin\AdminPageController;
use App\Http\Controllers\Web\BlogPageController;
use App\Http\Controllers\Web\CoursesPageController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\LandingController;
use App\Http\Controllers\Web\LearnPageController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');
Route::get('/courses', CoursesPageController::class)->name('courses.index');
Route::post('/inquiries', [LandingController::class, 'storeInquiry'])->name('inquiries.store');

Route::middleware(['auth', 'app.access'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/articles/{slug}', [BlogPageController::class, 'show'])->name('articles.show');

    Route::get('/learn', [LearnPageController::class, 'index'])->name('learn.index');
    Route::get('/learn/courses/{courseId}', [LearnPageController::class, 'showCourse'])->name('learn.courses.show');
    Route::get('/learn/courses/{courseId}/lessons/{lessonId}', [LearnPageController::class, 'showLesson'])->name('learn.lessons.show');
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

    Route::get('/blogs', [AdminPageController::class, 'blogsIndex'])->name('blogs.index');
    Route::get('/blogs/new', [AdminPageController::class, 'blogsCreate'])->name('blogs.create');
    Route::get('/blogs/{id}/edit', [AdminPageController::class, 'blogsEdit'])->name('blogs.edit');

    Route::get('/blog-access', [AdminPageController::class, 'blogAccessIndex'])->name('blog-access.index');
    Route::get('/blog-access/new', [AdminPageController::class, 'blogAccessCreate'])->name('blog-access.create');
    Route::get('/blog-access/{uid}/edit', [AdminPageController::class, 'blogAccessEdit'])->name('blog-access.edit');

    Route::get('/users', [AdminPageController::class, 'usersIndex'])->name('users.index');
    Route::get('/users/new', [AdminPageController::class, 'usersCreate'])->name('users.create');
    Route::get('/users/{uid}/edit', [AdminPageController::class, 'usersEdit'])->name('users.edit');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
