<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Galeri gambar pendukung sebuah materi (di-upload admin).
        Schema::create('material_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->unsignedSmallInteger('order')->default(1);
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->timestamps();

            $table->index(['material_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_images');
    }
};
