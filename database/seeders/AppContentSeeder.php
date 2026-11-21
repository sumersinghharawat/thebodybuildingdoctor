<?php

namespace Database\Seeders;

use App\Support\AppContentImporter;
use Illuminate\Database\Seeder;

class AppContentSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/app-content.json');

        if (! is_file($path)) {
            $this->command?->warn("No content snapshot found at {$path}");

            return;
        }

        $data = AppContentImporter::loadSnapshot($path);
        if (! $data) {
            $this->command?->error('Invalid app-content.json');

            return;
        }

        $this->command?->info('Seeding courses, lessons, mentorship, and users…');
        $this->command?->line('Snapshot from: '.($data['exportedAt'] ?? 'unknown'));

        $counts = AppContentImporter::import($data);

        $this->command?->table(
            ['Collection', 'Records'],
            collect($counts)->map(fn (int $count, string $key) => [$key, $count]),
        );

        $this->command?->newLine();
        $this->command?->warn('Seeded users password: '.AppContentImporter::seedPassword());

        if (($counts['media_files'] ?? 0) > 0) {
            $this->command?->info('Published '.$counts['media_files'].' media file(s) to storage.');
        }
    }
}
