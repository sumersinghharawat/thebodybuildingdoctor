<?php

namespace Database\Seeders;

use App\Support\FirestoreImporter;
use Illuminate\Database\Seeder;

class FirestoreDataSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/firestore-export.json');

        if (! is_file($path)) {
            $this->command?->warn("No Firebase export found at {$path}");
            $this->command?->warn('Run from web/: node scripts/export-mongodb-for-laravel.cjs');

            return;
        }

        $data = FirestoreImporter::loadExportFile($path);
        if (! $data) {
            $this->command?->error('Invalid firestore-export.json');

            return;
        }

        $this->command?->info('Importing Firebase export into MySQL…');
        $this->command?->line('Exported at: '.($data['exportedAt'] ?? 'unknown'));

        $counts = FirestoreImporter::import($data);

        $this->command?->table(
            ['Collection', 'Records'],
            collect($counts)->map(fn (int $count, string $key) => [$key, $count]),
        );

        $this->command?->newLine();
        $this->command?->warn('Imported users were given password: '.env('IMPORTED_USER_PASSWORD', 'ChangeMeAfterImport!'));
        $this->command?->warn('Ask users to reset passwords after go-live.');
    }
}
