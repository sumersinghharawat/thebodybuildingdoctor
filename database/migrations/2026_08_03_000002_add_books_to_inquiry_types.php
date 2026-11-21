<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both', 'books') NOT NULL DEFAULT 'both'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both') NOT NULL DEFAULT 'both'");
    }
};
