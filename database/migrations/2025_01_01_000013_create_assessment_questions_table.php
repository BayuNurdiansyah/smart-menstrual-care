<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 7 pertanyaan tetap (di-seed).
        Schema::create('assessment_questions', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('order'); // 1-7
            $table->text('question_text');
            // Label kategori untuk pengelompokan grafik Recharts.
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_questions');
    }
};
