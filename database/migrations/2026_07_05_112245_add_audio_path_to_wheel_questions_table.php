<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wheel_questions', function (Blueprint $table) {
            $table->string('audio_path')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('wheel_questions', function (Blueprint $table) {
            $table->dropColumn('audio_path');
        });
    }
};
