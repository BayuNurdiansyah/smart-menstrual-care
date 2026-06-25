<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Siklus menstruasi. Auto-close via Lazy Evaluation di CycleService.
        Schema::create('cycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();            // terisi saat siklus ditutup
            $table->unsignedTinyInteger('period_length')->nullable();  // lama haid (hari)
            $table->unsignedSmallInteger('cycle_length')->nullable();  // jarak antar siklus (hari)
            // Status: ongoing | closed
            $table->string('status')->default('ongoing');
            $table->boolean('auto_closed')->default(false);  // ditutup otomatis oleh lazy eval
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cycles');
    }
};
