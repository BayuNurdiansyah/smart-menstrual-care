<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Catatan harian yang mengisi kalender tracker.
        Schema::create('cycle_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained('cycles')->cascadeOnDelete();
            $table->date('log_date');
            // flow_level: light | medium | heavy
            $table->string('flow_level')->nullable();
            // Array gejala (disimpan sebagai TEXT/JSON di SQLite).
            $table->json('symptoms')->nullable();
            $table->string('mood')->nullable();
            $table->timestamps();

            $table->unique(['cycle_id', 'log_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycle_logs');
    }
};
