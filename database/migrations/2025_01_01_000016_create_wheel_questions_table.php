<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Soal Roda Keberuntungan (pilihan ganda A/B/C), dapat diatur admin.
        Schema::create('wheel_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->text('question');
            $table->string('option_a');
            $table->string('option_b');
            $table->string('option_c');
            // Jawaban benar: a | b | c (nullable bila belum ditentukan).
            $table->string('answer', 1)->nullable();
            $table->unsignedSmallInteger('order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['stage_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wheel_questions');
    }
};
