<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('contact_type'); // wa, telegram, email
            $table->string('contact');
            $table->string('level')->default('Pemula');
            $table->string('source')->default('Hero');
            $table->timestamp('submitted_at')->nullable();
            $table->text('notes')->nullable();

            // Event registration specific fields
            $table->string('event_id')->nullable();
            $table->string('event_title')->nullable();
            $table->string('has_account')->nullable(); // sudah, belum
            $table->string('demo_account_number')->nullable();
            $table->string('demo_investor_password')->nullable();
            $table->longText('screenshot_real_account')->nullable();
            $table->longText('screenshot_transfer')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
