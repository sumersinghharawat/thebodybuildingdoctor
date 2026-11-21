<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->enum('type', ['mentorship', 'courses', 'both', 'books', 'vault'])->default('both')->change();
            });

            return;
        }

        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both', 'books', 'vault') NOT NULL DEFAULT 'both'");
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('inquiries', function (Blueprint $table) {
                $table->enum('type', ['mentorship', 'courses', 'both', 'books'])->default('both')->change();
            });

            return;
        }

        DB::statement("ALTER TABLE inquiries MODIFY COLUMN type ENUM('mentorship', 'courses', 'both', 'books') NOT NULL DEFAULT 'both'");
    }
};
