<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedDevUser('admin@thebodybuildingdoctor.test', 'Administrator', ['administrator']);
        $this->seedDevUser('member@thebodybuildingdoctor.test', 'Media Channel Member', ['media_channel']);

        $this->call(FirestoreDataSeeder::class);
    }

    private function seedDevUser(string $email, string $name, array $roles): void
    {
        if (User::query()->where('email', $email)->exists()) {
            return;
        }

        User::query()->create([
            'id' => (string) Str::uuid(),
            'email' => $email,
            'name' => $name,
            'password' => 'password',
            'roles' => $roles,
        ]);
    }
}
