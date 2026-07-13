<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add encrypted face descriptor storage for passwordless authentication.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->longText('face_descriptor')->nullable()->after('photo_url');
            $table->timestamp('face_registered_at')->nullable()->after('face_descriptor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['face_descriptor', 'face_registered_at']);
        });
    }
};
