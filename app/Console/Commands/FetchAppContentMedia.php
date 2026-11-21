<?php

namespace App\Console\Commands;

use App\Support\SeedMedia;
use Illuminate\Console\Command;

class FetchAppContentMedia extends Command
{
    protected $signature = 'app-content:fetch-media {--force : Re-download files even if they already exist}';

    protected $description = 'Download images from app-content.json into database/seeders/media and build media-manifest.json';

    public function handle(): int
    {
        $snapshotPath = database_path('seeders/data/app-content.json');
        if (! is_file($snapshotPath)) {
            $this->error('Missing database/seeders/data/app-content.json');

            return self::FAILURE;
        }

        $data = json_decode(file_get_contents($snapshotPath), true);
        if (! is_array($data)) {
            $this->error('Invalid app-content.json');

            return self::FAILURE;
        }

        $targets = SeedMedia::collectTargetsFromSnapshot($data);
        $manifest = SeedMedia::loadManifest();
        $downloaded = 0;
        $skipped = 0;
        $failed = 0;

        $this->info('Downloading '.count($targets).' images…');

        foreach ($targets as $url => $relativePath) {
            $destination = SeedMedia::seedRoot().'/'.$relativePath;

            if (! $this->option('force') && is_file($destination)) {
                $manifest[$url] = $relativePath;
                $skipped++;

                continue;
            }

            $this->line('  '.$relativePath);

            if (SeedMedia::download($url, $destination)) {
                $manifest[$url] = $relativePath;
                $downloaded++;
                SeedMedia::saveManifest($manifest);
            } else {
                $this->warn("  Failed: {$url}");
                $failed++;
            }
        }

        SeedMedia::saveManifest($manifest);

        $this->newLine();
        $this->table(['Result', 'Count'], [
            ['Downloaded', $downloaded],
            ['Skipped (existing)', $skipped],
            ['Failed', $failed],
            ['Manifest entries', count($manifest)],
        ]);

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
