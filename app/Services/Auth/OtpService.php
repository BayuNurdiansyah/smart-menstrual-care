<?php

namespace App\Services\Auth;

use App\Enums\OtpPurpose;
use App\Exceptions\OtpException;
use App\Repositories\Contracts\OtpRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    /** Masa berlaku OTP (menit). */
    private const TTL_MINUTES = 5;

    /** Maksimal percobaan input OTP yang gagal sebelum terkunci. */
    private const MAX_VERIFY_ATTEMPTS = 3;

    /** Durasi penguncian limiter verifikasi (detik) setelah batas tercapai. */
    private const LOCK_SECONDS = 300;

    /** Jeda minimal antar pengiriman kode (detik). */
    private const RESEND_COOLDOWN = 60;

    public function __construct(
        private readonly OtpRepositoryInterface $otpRepository,
    ) {
    }

    /**
     * Generate OTP baru, simpan (transaksional), lalu kirim via email.
     * Membatalkan kode lama agar hanya satu OTP aktif per (email, purpose).
     */
    public function generate(string $email, OtpPurpose $purpose): void
    {
        // Throttle pengiriman: cegah spam "kirim ulang".
        $recent = $this->otpRepository->countRecent($email, $purpose->value, self::RESEND_COOLDOWN);
        if ($recent > 0) {
            throw OtpException::resendCooldown(self::RESEND_COOLDOWN);
        }

        $code = $this->randomCode();

        // WAJIB transaksi: invalidate + insert harus atomik agar tidak ada
        // dua OTP aktif akibat race condition (penting di SQLite).
        DB::transaction(function () use ($email, $purpose, $code) {
            $this->otpRepository->invalidateExisting($email, $purpose->value);

            $this->otpRepository->create([
                'email'        => $email,
                'code_hash'    => Hash::make($code), // simpan hash, bukan plaintext
                'purpose'      => $purpose->value,
                'expires_at'   => now()->addMinutes(self::TTL_MINUTES),
                'last_sent_at' => now(),
                'attempts'     => 0,
            ]);
        });

        // Siklus OTP baru -> reset penghitung percobaan verifikasi.
        RateLimiter::clear($this->verifyKey($email, $purpose));

        $this->sendCode($email, $code);
    }

    /**
     * Validasi OTP. Memakai RateLimiter::attempt bawaan Laravel:
     * maksimal 3x percobaan input GAGAL, lalu terkunci sementara.
     */
    public function verify(string $email, string $code, OtpPurpose $purpose): bool
    {
        $key = $this->verifyKey($email, $purpose);

        // Sudah melewati batas -> tolak dengan info waktu tunggu.
        if (RateLimiter::tooManyAttempts($key, self::MAX_VERIFY_ATTEMPTS)) {
            throw OtpException::tooManyAttempts(RateLimiter::availableIn($key));
        }

        // attempt() menambah satu "hit" lalu menjalankan callback.
        $result = RateLimiter::attempt(
            $key,
            self::MAX_VERIFY_ATTEMPTS,
            fn (): bool => $this->checkCode($email, $code, $purpose),
            self::LOCK_SECONDS
        );

        // Sukses -> reset limiter agar hit tadi tidak terhitung sebagai gagal.
        if ($result === true) {
            RateLimiter::clear($key);

            return true;
        }

        return false; // kode salah; hit gagal tetap tercatat di limiter
    }

    /**
     * Pengecekan inti kode terhadap OTP aktif terbaru.
     * Konsumsi OTP valid dibungkus transaksi (cegah pemakaian ganda).
     */
    private function checkCode(string $email, string $code, OtpPurpose $purpose): bool
    {
        $otp = $this->otpRepository->latestActive($email, $purpose->value);

        if ($otp === null) {
            return false; // tidak ada / sudah kedaluwarsa / sudah dikonsumsi
        }

        if (! Hash::check($code, $otp->code_hash)) {
            $this->otpRepository->incrementAttempts($otp);

            return false;
        }

        DB::transaction(fn () => $this->otpRepository->markConsumed($otp));

        return true;
    }

    private function randomCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function verifyKey(string $email, OtpPurpose $purpose): string
    {
        return 'otp-verify:' . $purpose->value . ':' . mb_strtolower($email);
    }

    private function sendCode(string $email, string $code): void
    {
        // PLACEHOLDER: ganti dengan Mailable/Notification berdesain saat siap.
        $minutes = self::TTL_MINUTES;
        Mail::raw(
            "Kode verifikasi Smart Menstrual Care Anda: {$code}\n"
                . "Kode berlaku selama {$minutes} menit. Jangan bagikan ke siapa pun.",
            function ($message) use ($email) {
                $message->to($email)->subject('Kode Verifikasi - Smart Menstrual Care');
            }
        );
    }
}
