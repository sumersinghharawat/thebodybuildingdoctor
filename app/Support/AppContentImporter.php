<?php

namespace App\Support;

use App\Models\Blog;
use App\Models\BlogAccess;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Inquiry;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Str;

class AppContentImporter
{
    public static function seedPassword(): string
    {
        return (string) env('SEED_USER_PASSWORD', env('IMPORTED_USER_PASSWORD', 'password'));
    }

    /**
     * @return array<string, int>
     */
    public static function import(array $data, ?string $defaultPassword = null): array
    {
        $password = $defaultPassword ?? self::seedPassword();
        $manifest = SeedMedia::manifestForSnapshot($data);
        $mediaPublished = SeedMedia::publishToStorage();

        $counts = [
            'users' => 0,
            'courses' => 0,
            'lessons' => 0,
            'enrollments' => 0,
            'blogs' => 0,
            'inquiries' => 0,
            'blog_access' => 0,
            'skipped_lessons' => 0,
            'skipped_enrollments' => 0,
            'media_files' => $mediaPublished,
        ];

        foreach ($data['users'] ?? [] as $row) {
            $uid = (string) ($row['uid'] ?? $row['_id'] ?? $row['id'] ?? Str::uuid());
            $roles = self::normalizeRoles($row['roles'] ?? $row['role'] ?? null);

            User::query()->updateOrCreate(
                ['id' => $uid],
                [
                    'email' => $row['email'] ?? "{$uid}@import.local",
                    'name' => $row['displayName'] ?? $row['name'] ?? 'Imported User',
                    'password' => $password,
                    'roles' => $roles,
                ],
            );
            $counts['users']++;
        }

        foreach ($data['courses'] ?? [] as $row) {
            $id = (string) ($row['id'] ?? $row['_id']);
            Course::query()->updateOrCreate(
                ['id' => $id],
                [
                    'title' => $row['title'] ?? 'Untitled',
                    'slug' => $row['slug'] ?? Str::slug($row['title'] ?? $id),
                    'description' => $row['description'] ?? '',
                    'description_html' => SeedMedia::rewriteHtml($row['descriptionHtml'] ?? null, $manifest),
                    'thumbnail_url' => self::resolveThumbnailPath($row['thumbnailUrl'] ?? '', $manifest),
                    'instructor_name' => $row['instructorName'] ?? '',
                    'level' => $row['level'] ?? 'beginner',
                    'category' => $row['category'] ?? '',
                    'published' => (bool) ($row['published'] ?? false),
                    'price_cents' => (int) ($row['priceCents'] ?? 0),
                    'lesson_count' => (int) ($row['lessonCount'] ?? 0),
                    'total_duration_sec' => (int) ($row['totalDurationSec'] ?? 0),
                    'sort_order' => (int) ($row['order'] ?? 0),
                ],
            );
            $counts['courses']++;
        }

        self::ensureCoursesExist($data, $counts);

        $courseIds = Course::query()->pluck('id')->flip();
        $userIds = User::query()->pluck('id')->flip();

        foreach ($data['lessons'] ?? [] as $row) {
            $id = (string) ($row['id'] ?? $row['_id']);
            $courseId = (string) $row['courseId'];

            if (! isset($courseIds[$courseId])) {
                $counts['skipped_lessons']++;

                continue;
            }

            Lesson::query()->updateOrCreate(
                ['id' => $id],
                [
                    'course_id' => (string) $row['courseId'],
                    'title' => $row['title'] ?? 'Lesson',
                    'slug' => $row['slug'] ?? null,
                    'sort_order' => (int) ($row['order'] ?? 0),
                    'duration_sec' => (int) ($row['durationSec'] ?? 0),
                    'video_url' => $row['videoUrl'] ?? '',
                    'content_html' => SeedMedia::rewriteHtml($row['contentHtml'] ?? null, $manifest),
                    'free_preview' => (bool) ($row['freePreview'] ?? false),
                    'thumbnail_url' => self::resolveThumbnailPath($row['thumbnailUrl'] ?? '', $manifest),
                ],
            );
            $counts['lessons']++;
        }

        self::syncCourseStats();

        foreach ($data['enrollments'] ?? [] as $row) {
            $uid = (string) ($row['uid'] ?? '');
            $courseId = (string) ($row['courseId'] ?? '');
            if ($uid === '' || $courseId === '' || ! isset($userIds[$uid]) || ! isset($courseIds[$courseId])) {
                $counts['skipped_enrollments']++;

                continue;
            }

            Enrollment::query()->updateOrCreate(
                [
                    'user_id' => $uid,
                    'course_id' => $courseId,
                ],
                [
                    'enrolled_at' => $row['enrolledAt'] ?? now(),
                    'source' => $row['source'] ?? 'admin',
                    'status' => $row['status'] ?? 'active',
                    'expires_at' => $row['expiresAt'] ?? null,
                ],
            );
            $counts['enrollments']++;
        }

        foreach ($data['blogs'] ?? [] as $row) {
            $id = (string) ($row['id'] ?? $row['_id']);
            Blog::query()->updateOrCreate(
                ['id' => $id],
                [
                    'title' => $row['title'] ?? 'Mentorship',
                    'slug' => $row['slug'] ?? Str::slug($row['title'] ?? $id),
                    'excerpt' => $row['excerpt'] ?? '',
                    'content_html' => SeedMedia::rewriteHtml($row['contentHtml'] ?? '', $manifest) ?? '',
                    'thumbnail_url' => self::resolveThumbnailPath($row['thumbnailUrl'] ?? '', $manifest),
                    'author_name' => $row['authorName'] ?? 'The Bodybuilding Doctor',
                    'published' => (bool) ($row['published'] ?? false),
                    'published_at' => $row['publishedAt'] ?? null,
                    'sort_order' => (int) ($row['order'] ?? 0),
                ],
            );
            $counts['blogs']++;
        }

        foreach ($data['inquiries'] ?? [] as $row) {
            $id = (string) ($row['id'] ?? $row['_id'] ?? Str::random(24));
            Inquiry::query()->updateOrCreate(
                ['id' => $id],
                [
                    'name' => $row['name'] ?? '',
                    'email' => $row['email'] ?? '',
                    'phone' => $row['phone'] ?? null,
                    'type' => $row['type'] ?? 'both',
                    'course_id' => $row['courseId'] ?: null,
                    'course_title' => $row['courseTitle'] ?: null,
                    'message' => $row['message'] ?? null,
                    'status' => $row['status'] ?? 'new',
                ],
            );
            $counts['inquiries']++;
        }

        foreach ($data['blog_access'] ?? [] as $row) {
            $uid = (string) ($row['uid'] ?? $row['_id'] ?? $row['id'] ?? '');
            if ($uid === '') {
                continue;
            }

            BlogAccess::query()->updateOrCreate(
                ['user_id' => $uid],
                [
                    'granted_at' => $row['grantedAt'] ?? now(),
                    'status' => $row['status'] ?? 'active',
                    'note' => $row['note'] ?? null,
                ],
            );
            $counts['blog_access']++;
        }

        return [
            'users' => $counts['users'],
            'courses' => $counts['courses'],
            'lessons' => $counts['lessons'],
            'enrollments' => $counts['enrollments'],
            'mentorship' => $counts['blogs'],
            'inquiries' => $counts['inquiries'] ?? 0,
            'mentorship_access' => $counts['blog_access'],
            'skipped_lessons' => $counts['skipped_lessons'] ?? 0,
            'skipped_enrollments' => $counts['skipped_enrollments'] ?? 0,
            'media_files' => $counts['media_files'] ?? 0,
        ];
    }

    private static function resolveThumbnailPath(?string $url, array $manifest): string
    {
        if ($url === null || $url === '') {
            return '';
        }

        return SeedMedia::pathForUrl($url, $manifest) ?? '';
    }

    /**
     * @return array<string, mixed>|null
     */
    public static function loadSnapshot(string $path): ?array
    {
        if (! is_file($path)) {
            return null;
        }

        $data = json_decode(file_get_contents($path), true);

        return is_array($data) ? $data : null;
    }

    private static function normalizeRoles(mixed $roles): array
    {
        if (is_array($roles) && $roles !== []) {
            $normalized = array_values(array_unique(array_map(function (string $role) {
                return match ($role) {
                    'admin' => 'administrator',
                    'customer', 'student' => 'media_channel',
                    default => $role,
                };
            }, array_map('strval', $roles))));

            return $normalized;
        }

        if (is_string($roles) && $roles !== '') {
            return self::normalizeRoles([$roles]);
        }

        return ['media_channel'];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, int>  $counts
     */
    private static function ensureCoursesExist(array $data, array &$counts): void
    {
        $referenced = [];

        foreach ($data['lessons'] ?? [] as $row) {
            if (! empty($row['courseId'])) {
                $referenced[(string) $row['courseId']] = true;
            }
        }

        foreach ($data['enrollments'] ?? [] as $row) {
            if (! empty($row['courseId'])) {
                $referenced[(string) $row['courseId']] = true;
            }
        }

        $existing = Course::query()->pluck('id')->flip();

        foreach (array_keys($referenced) as $courseId) {
            if (isset($existing[$courseId])) {
                continue;
            }

            Course::query()->create([
                'id' => $courseId,
                'title' => Str::headline(str_replace('-', ' ', $courseId)),
                'slug' => Str::slug($courseId),
                'description' => 'Placeholder for orphaned lessons.',
                'thumbnail_url' => '',
                'instructor_name' => 'The Bodybuilding Doctor',
                'level' => 'beginner',
                'category' => 'Imported',
                'published' => false,
                'price_cents' => 0,
                'lesson_count' => 0,
                'total_duration_sec' => 0,
                'sort_order' => 0,
            ]);
            $counts['courses']++;
        }
    }

    private static function syncCourseStats(): void
    {
        Course::query()->each(function (Course $course) {
            $lessons = Lesson::query()->where('course_id', $course->id)->get();
            $course->update([
                'lesson_count' => $lessons->count(),
                'total_duration_sec' => $lessons->sum('duration_sec'),
            ]);
        });
    }
}
