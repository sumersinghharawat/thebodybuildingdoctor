<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store on-premise Faceplugin face descriptors instead of FaceIO IDs.
     */
    public function up(): void
    {
        if (Schema::hasColumn('users', 'faceio_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropUnique('users_faceio_id_unique');
            });

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('faceio_id');
            });
        }

        if (! Schema::hasColumn('users', 'face_descriptor')) {
            Schema::table('users', function (Blueprint $table) {
                $table->longText('face_descriptor')->nullable()->after('photo_url');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'face_descriptor')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('face_descriptor');
            });
        }

        if (! Schema::hasColumn('users', 'faceio_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('faceio_id', 64)->nullable()->unique()->after('photo_url');
            });
        }
    }
};
