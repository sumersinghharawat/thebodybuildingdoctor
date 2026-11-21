<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Import the live production content snapshot.
     *
     * Safe for production: if courses/users already exist, this is a no-op
     * so running `php artisan migrate` will not overwrite live data.
     * Fresh / empty databases receive the snapshot from pinkujqu_doctor.sql.
     */
    public function up(): void
    {
        if (! Schema::hasTable('courses') || ! Schema::hasTable('users')) {
            return;
        }

        if (DB::table('courses')->exists() || DB::table('users')->exists()) {
            return;
        }

        if (app()->environment('testing') || Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        $path = database_path('data/live_snapshot.sql');

        if (! File::exists($path)) {
            throw new RuntimeException("Live snapshot missing: {$path}");
        }

        $sql = File::get($path);

        DB::connection()->getPdo()->exec('SET FOREIGN_KEY_CHECKS=0');

        try {
            foreach ($this->splitStatements($sql) as $statement) {
                if ($statement === '') {
                    continue;
                }

                DB::unprepared($statement);
            }
        } finally {
            DB::connection()->getPdo()->exec('SET FOREIGN_KEY_CHECKS=1');
        }
    }

    public function down(): void
    {
        // Intentionally empty — do not wipe live content on rollback.
    }

    /**
     * @return list<string>
     */
    private function splitStatements(string $sql): array
    {
        $statements = [];
        $buffer = '';
        $inString = false;
        $length = strlen($sql);

        for ($i = 0; $i < $length; $i++) {
            $char = $sql[$i];
            $next = $i + 1 < $length ? $sql[$i + 1] : '';

            // Skip line comments outside strings.
            if (! $inString && $char === '-' && $next === '-') {
                while ($i < $length && $sql[$i] !== "\n") {
                    $i++;
                }

                continue;
            }

            if ($char === '\\' && $inString && $next !== '') {
                $buffer .= $char.$next;
                $i++;

                continue;
            }

            if ($char === "'" && ! $inString) {
                $inString = true;
                $buffer .= $char;

                continue;
            }

            if ($char === "'" && $inString) {
                // Escaped quote '' inside SQL strings.
                if ($next === "'") {
                    $buffer .= "''";
                    $i++;

                    continue;
                }

                $inString = false;
                $buffer .= $char;

                continue;
            }

            if ($char === ';' && ! $inString) {
                $statement = trim($buffer);
                if ($statement !== '') {
                    $statements[] = $statement;
                }
                $buffer = '';

                continue;
            }

            $buffer .= $char;
        }

        $tail = trim($buffer);
        if ($tail !== '') {
            $statements[] = $tail;
        }

        return $statements;
    }
};
