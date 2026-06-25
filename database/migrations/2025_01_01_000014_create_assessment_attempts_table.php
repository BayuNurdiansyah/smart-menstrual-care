<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Satu pengisian assessment per HARI menstruasi (terikat siklus).
        Schema::create('assessment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Siklus tempat assessment harian ini berada (boleh null utk fleksibilitas).
            $table->foreignId('cycle_id')->nullable()->constrained('cycles')->nullOnDelete();
            // Tanggal assessment (hari menstruasi).
            $table->date('assessment_date');
            $table->integer('total_score')->default(0); // agregat utk grafik tren
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            // Cegah dobel isi pada tanggal yang sama.
            $table->unique(['user_id', 'assessment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_attempts');
    }
};
