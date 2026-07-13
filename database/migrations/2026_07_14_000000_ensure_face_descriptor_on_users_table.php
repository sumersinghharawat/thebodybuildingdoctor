<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ensure face_descriptor exists for face-api.js Face Lock (JSON, encrypted at rest).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'face_descriptor')) {
            Schema::table('users', function (Blueprint $table) {
                $table->longText('face_descriptor')->nullable()->after('photo_url');
            });
        }

        if (! Schema::hasColumn('users', 'face_registered_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('face_registered_at')->nullable()->after('face_descriptor');
            });
        }
    }

    public function down(): void
    {
        // Intentionally left empty — column may be shared with prior face auth migrations.
    }
};
