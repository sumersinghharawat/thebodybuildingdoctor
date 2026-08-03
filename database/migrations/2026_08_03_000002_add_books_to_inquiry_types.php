<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both', 'books') NOT NULL DEFAULT 'both'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both') NOT NULL DEFAULT 'both'");
    }
};
