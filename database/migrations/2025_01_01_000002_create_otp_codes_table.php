<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            // Simpan HASH dari kode, bukan plaintext.
            $table->string('code_hash');
            // Tujuan OTP: register | login | reset
            $table->string('purpose')->default('register');
            $table->timestamp('expires_at');          // now + 5 menit
            $table->timestamp('consumed_at')->nullable(); // anti reuse
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('last_sent_at')->nullable(); // dasar rate-limit kirim ulang
            $table->timestamps();

            $table->index(['email', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_codes');
    }
};
