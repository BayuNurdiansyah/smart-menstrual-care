<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            // Password hanya untuk admin/guru. Murid/ortu login pakai nama+kelas.
            $table->string('password')->nullable();
            // Role: murid | ortu | guru | admin
            $table->string('role')->default('murid')->index();
            // Kelas: dipakai murid/ortu untuk login sederhana (nama + kelas).
            $table->string('kelas')->nullable()->index();
            $table->date('date_of_birth')->nullable();
            $table->string('region')->nullable(); // Wilayah akun / alamat
            $table->timestamp('email_verified_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
