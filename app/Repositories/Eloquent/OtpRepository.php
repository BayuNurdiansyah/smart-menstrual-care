<?php

namespace App\Repositories\Eloquent;

use App\Models\OtpCode;
use App\Repositories\Contracts\OtpRepositoryInterface;

class OtpRepository implements OtpRepositoryInterface
{
    public function create(array $data): OtpCode
    {
        return OtpCode::create($data);
    }

    public function latestActive(string $email, string $purpose): ?OtpCode
    {
        // Index (email, purpose) dipakai; ambil yang masih hidup & belum dikonsumsi.
        return OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest('id')
            ->first();
    }

    public function incrementAttempts(OtpCode $otp): OtpCode
    {
        $otp->increment('attempts');

        return $otp->refresh();
    }

    public function markConsumed(OtpCode $otp): OtpCode
    {
        $otp->forceFill(['consumed_at' => now()])->save();

        return $otp;
    }

    public function invalidateExisting(string $email, string $purpose): void
    {
        // Tutup semua OTP aktif sebelumnya dalam satu query update.
        OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);
    }

    public function countRecent(string $email, string $purpose, int $withinSeconds): int
    {
        return OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->where('created_at', '>=', now()->subSeconds($withinSeconds))
            ->count();
    }

    public function purgeExpired(): int
    {
        return OtpCode::where('expires_at', '<', now())->delete();
    }
}
