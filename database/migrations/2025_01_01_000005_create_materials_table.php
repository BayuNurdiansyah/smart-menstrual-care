<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // KOREKSI: TIDAK ada PDF / upload file.
        // Materi hanya berisi teks (text_content) dan video (youtube_video_id).
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->string('title'); // judul topik (diklik baru muncul)
            // Konten teks materi (HTML/markdown sederhana).
            $table->text('text_content')->nullable();
            // HANYA ID video YouTube (11 karakter), diekstrak via mutator di Model.
            $table->string('youtube_video_id')->nullable();
            $table->unsignedSmallInteger('order')->default(1); // urutan topik dalam tahap
            $table->boolean('is_published')->default(true);
            $table->timestamps();

            $table->index(['stage_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
