<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->longText('poster_image')->nullable();
            $table->string('title');
            $table->string('date');
            $table->string('time')->nullable();
            $table->text('description')->nullable();
            $table->string('category')->default('Workshop Khusus');
            $table->string('status')->default('upcoming');
            $table->string('location')->nullable();
            $table->string('speaker')->nullable();

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('start_time')->nullable();
            $table->string('end_time')->nullable();

            $table->string('meeting_url')->nullable();
            $table->string('trading_session')->nullable();
            $table->string('target_instrument')->nullable();
            $table->string('trading_platform')->nullable();

            $table->string('workshop_subtype')->nullable();
            $table->string('prize_pool')->nullable();
            $table->string('max_drawdown')->nullable();
            $table->string('registration_deadline')->nullable();

            $table->string('venue_city')->nullable();
            $table->text('venue_address')->nullable();
            $table->integer('seat_quota')->nullable();

            $table->json('key_takeaways')->nullable();
            $table->string('attendees_count')->nullable();
            $table->string('action_text')->nullable();
            $table->string('action_type')->nullable();
            $table->text('recap_note')->nullable();
            $table->string('telegram_group_url')->nullable();
            $table->string('tutorial_account_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
