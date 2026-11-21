<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->string('video_url')->default('')->after('pdf_url');
        });

        Schema::table('blogs', function (Blueprint $table) {
            $table->string('video_url')->default('')->after('pdf_url');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });

        Schema::table('blogs', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
    }
};
