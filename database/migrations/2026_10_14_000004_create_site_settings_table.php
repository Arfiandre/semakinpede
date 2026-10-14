<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('project_title')->default('Semakin Pede');
            $table->string('project_tagline')->default('Komunitas Trader Futures Indonesia');
            $table->text('project_description')->nullable();
            $table->longText('logo_url')->nullable();
            $table->json('social_media')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
