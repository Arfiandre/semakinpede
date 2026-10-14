<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brokers', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('short_name');
            $table->longText('logo_url')->nullable();
            $table->string('license_number');
            $table->string('status_badge')->default('Mitra Utama Resmi');
            $table->string('tagline');
            $table->text('description');
            $table->json('highlights')->nullable();
            $table->string('action_text')->default('Konsultasi Pendaftaran TPFX');
            $table->string('action_url');
            $table->string('official_site_url')->default('https://bappebti.go.id');
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brokers');
    }
};
