<?php

namespace App\Console\Commands;

use App\Support\FirestoreImporter;
use Illuminate\Console\Command;

class ImportFirestoreJson extends Command
{
    protected $signature = 'import:firestore-json {path : Path to export JSON file}';

    protected $description = 'Import courses, lessons, blogs, enrollments, users from a Firestore/Mongo JSON export';

    public function handle(): int
    {
        $path = $this->argument('path');
        $data = FirestoreImporter::loadExportFile($path);

        if (! $data) {
            $this->error("File not found or invalid JSON: {$path}");

            return self::FAILURE;
        }

        $counts = FirestoreImporter::import($data);

        $this->table(['Collection', 'Imported'], collect($counts)->map(fn ($v, $k) => [$k, $v]));

        return self::SUCCESS;
    }
}
