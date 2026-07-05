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

        $this->call(AppContentSeeder::class);
    }

    private function seedDevUser(string $email, string $name, array $roles): void
    {
        $user = User::query()->firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->id = (string) Str::uuid();
        }

        $user->fill([
            'name' => $name,
            'password' => 'password',
            'roles' => $roles,
        ]);
        $user->save();
    }
}
