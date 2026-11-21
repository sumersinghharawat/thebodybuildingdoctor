<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('books', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->longText('description_html')->nullable();
            $table->string('thumbnail_url')->default('');
            $table->string('pdf_path')->default('');
            $table->unsignedInteger('price_cents')->default(0);
            $table->boolean('published')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('book_purchases', function (Blueprint $table) {
            $table->uuid('user_id');
            $table->string('book_id', 64);
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('granted_at')->nullable();
            $table->enum('source', ['purchase', 'admin'])->default('admin');
            $table->enum('status', ['pending', 'active', 'revoked'])->default('pending');
            $table->string('note')->nullable();
            $table->timestamps();

            $table->primary(['user_id', 'book_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('book_id')->references('id')->on('books')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_purchases');
        Schema::dropIfExists('books');
    }
};
