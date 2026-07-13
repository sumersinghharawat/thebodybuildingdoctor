<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Store FaceIO facial IDs instead of local face descriptors.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('faceio_id', 64)->nullable()->unique()->after('photo_url');
        });

        if (Schema::hasColumn('users', 'face_descriptor')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('face_descriptor');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('faceio_id');
            $table->longText('face_descriptor')->nullable();
        });
    }
};
