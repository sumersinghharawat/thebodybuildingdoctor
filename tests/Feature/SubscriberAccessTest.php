<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookPurchase;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriberAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_subscriber_can_login_and_is_sent_to_courses(): void
    {
        $user = User::factory()->subscriber()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('learn.index', absolute: false));
    }

    public function test_user_without_app_role_cannot_login(): void
    {
        $user = User::factory()->create([
            'roles' => [],
        ]);

        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_subscriber_can_login_via_api(): void
    {
        $user = User::factory()->subscriber()->create();

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])
            ->assertOk()
            ->assertJsonPath('user.role', 'subscriber')
            ->assertJsonPath('user.canBrowseCatalog', false);
    }

    public function test_subscriber_only_sees_granted_books_and_courses(): void
    {
        $user = User::factory()->subscriber()->create();

        $grantedBook = $this->makeBook('granted-book', 'Granted Book');
        $hiddenBook = $this->makeBook('hidden-book', 'Hidden Book');
        $grantedCourse = $this->makeCourse('granted-course', 'Granted Course');
        $hiddenCourse = $this->makeCourse('hidden-course', 'Hidden Course');

        BookPurchase::query()->create([
            'user_id' => $user->id,
            'book_id' => $grantedBook->id,
            'status' => 'active',
            'source' => 'admin',
            'granted_at' => now(),
        ]);

        Enrollment::query()->create([
            'user_id' => $user->id,
            'course_id' => $grantedCourse->id,
            'status' => 'active',
            'source' => 'admin',
            'enrolled_at' => now(),
        ]);

        $this->actingAs($user);

        $this->get(route('books.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Books/Index')
                ->has('books', 1)
                ->where('books.0.id', $grantedBook->id)
                ->where('canBrowseCatalog', false)
            );

        $this->get(route('books.show', $grantedBook->id))->assertOk();
        $this->get(route('books.show', $hiddenBook->id))->assertNotFound();

        $this->get(route('learn.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Learn/Index')
                ->has('enrolledCourses', 1)
                ->where('enrolledCourses.0.id', $grantedCourse->id)
                ->has('browseCourses', 0)
            );

        $this->get(route('learn.courses.show', $grantedCourse->id))->assertOk();
        $this->get(route('learn.courses.show', $hiddenCourse->id))->assertNotFound();
        $this->get(route('dashboard'))->assertRedirect(route('learn.index'));
    }

    public function test_media_channel_member_still_sees_the_full_catalog(): void
    {
        $user = User::factory()->create(['roles' => ['media_channel']]);
        $this->makeBook('catalog-book', 'Catalog Book');
        $this->makeCourse('catalog-course', 'Catalog Course');

        $this->actingAs($user);

        $this->get(route('books.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Books/Index')
                ->has('books', 1)
                ->where('canBrowseCatalog', true)
            );

        $this->get(route('learn.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Learn/Index')
                ->has('browseCourses', 1)
            );
    }

    private function makeBook(string $id, string $title): Book
    {
        return Book::query()->create([
            'id' => $id,
            'title' => $title,
            'slug' => $id,
            'description' => 'Description',
            'published' => true,
            'price_cents' => 0,
            'sort_order' => 1,
        ]);
    }

    private function makeCourse(string $id, string $title): Course
    {
        return Course::query()->create([
            'id' => $id,
            'title' => $title,
            'slug' => $id,
            'description' => 'Description',
            'published' => true,
            'sort_order' => 1,
        ]);
    }
}
