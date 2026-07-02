<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->longText('description_html')->nullable();
            $table->string('thumbnail_url')->default('');
            $table->string('instructor_name')->default('');
            $table->enum('level', ['beginner', 'intermediate', 'advanced'])->default('beginner');
            $table->string('category')->default('');
            $table->boolean('published')->default(false);
            $table->unsignedInteger('price_cents')->default(0);
            $table->unsignedInteger('lesson_count')->default(0);
            $table->unsignedInteger('total_duration_sec')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('course_id', 64);
            $table->string('title');
            $table->string('slug')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->unsignedInteger('duration_sec')->default(0);
            $table->string('video_url')->default('');
            $table->longText('content_html')->nullable();
            $table->boolean('free_preview')->default(false);
            $table->string('thumbnail_url')->nullable();
            $table->timestamps();

            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
            $table->index(['course_id', 'sort_order']);
        });

        Schema::create('enrollments', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->string('course_id', 64);
            $table->timestamp('enrolled_at');
            $table->enum('source', ['free', 'purchase', 'admin'])->default('admin');
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->primary(['user_id', 'course_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('course_id')->references('id')->on('courses')->cascadeOnDelete();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content_html');
            $table->string('thumbnail_url')->default('');
            $table->string('author_name')->default('The Bodybuilding Doctor');
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('blog_access', function (Blueprint $table) {
            $table->uuid('user_id')->primary();
            $table->timestamp('granted_at');
            $table->enum('status', ['active', 'revoked'])->default('active');
            $table->string('note')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('inquiries', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->enum('type', ['mentorship', 'courses', 'both'])->default('both');
            $table->string('course_id', 64)->nullable();
            $table->string('course_title')->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'contacted', 'closed'])->default('new');
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('blog_access');
        Schema::dropIfExists('blogs');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
    }
};
