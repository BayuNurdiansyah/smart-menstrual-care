<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Hanya skor/waktu TERBAIK yang disimpan (satu baris per murid per game).
        Schema::create('game_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
            $table->integer('best_score')->default(0);
            // Waktu tercepat (untuk game ber-timer seperti Drag & Drop).
            $table->integer('best_time_seconds')->nullable();
            $table->integer('plays_count')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'game_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_scores');
    }
};
