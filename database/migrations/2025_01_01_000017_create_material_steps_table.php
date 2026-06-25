<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Langkah-langkah dalam sebuah materi (mis. cara membuang pembalut),
        // tiap langkah boleh punya ilustrasi (file di-upload admin).
        Schema::create('material_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->unsignedSmallInteger('order')->default(1);
            $table->text('text');
            $table->string('image_path')->nullable(); // path di disk public
            $table->timestamps();

            $table->index(['material_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('material_steps');
    }
};
