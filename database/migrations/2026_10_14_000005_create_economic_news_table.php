<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('economic_news', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('country');
            $table->string('date_raw')->nullable();
            $table->string('time_formatted')->nullable();
            $table->string('date_formatted')->nullable();
            $table->string('day_name')->nullable();
            $table->string('impact')->default('Medium'); // High, Medium
            $table->string('forecast')->nullable();
            $table->string('previous')->nullable();
            $table->string('source')->default('ForexFactory.com');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('economic_news');
    }
};
