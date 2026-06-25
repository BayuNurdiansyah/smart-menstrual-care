<?php

namespace App\Repositories\Contracts;

use App\Models\OtpCode;

interface OtpRepositoryInterface
{
    public function create(array $data): OtpCode;

    /** Ambil OTP aktif terbaru (belum dikonsumsi) untuk email + tujuan. */
    public function latestActive(string $email, string $purpose): ?OtpCode;

    public function incrementAttempts(OtpCode $otp): OtpCode;

    public function markConsumed(OtpCode $otp): OtpCode;

    /** Batalkan seluruh OTP aktif sebelumnya (saat kirim kode baru). */
    public function invalidateExisting(string $email, string $purpose): void;

    /** Hitung OTP yang dikirim dalam rentang waktu (untuk rate limiting). */
    public function countRecent(string $email, string $purpose, int $withinSeconds): int;

    /** Bersihkan OTP kedaluwarsa. */
    public function purgeExpired(): int;
}
