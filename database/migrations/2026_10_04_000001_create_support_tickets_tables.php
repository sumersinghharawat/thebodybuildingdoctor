<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->uuid('user_id')->nullable();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->string('status', 32)->default('open');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('email');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });

        Schema::create('support_ticket_attachments', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('support_ticket_id', 64);
            $table->string('path');
            $table->string('original_name');
            $table->string('mime', 120)->default('');
            $table->string('kind', 16);
            $table->unsignedInteger('size_bytes')->default(0);
            $table->timestamps();

            $table->foreign('support_ticket_id')->references('id')->on('support_tickets')->cascadeOnDelete();
        });

        Schema::create('support_ticket_replies', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('support_ticket_id', 64);
            $table->uuid('user_id')->nullable();
            $table->text('body');
            $table->boolean('is_admin')->default(true);
            $table->timestamps();

            $table->foreign('support_ticket_id')->references('id')->on('support_tickets')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_ticket_replies');
        Schema::dropIfExists('support_ticket_attachments');
        Schema::dropIfExists('support_tickets');
    }
};
