<?php

namespace App\Repositories;

use App\Models\OtpCode;
use App\Repositories\Contracts\OtpRepositoryInterface;

class EloquentOtpRepository implements OtpRepositoryInterface
{
    public function create(array $data): OtpCode
    {
        return OtpCode::create($data);
    }

    public function latestActive(string $email, string $purpose): ?OtpCode
    {
        return OtpCode::where('email', $email)
            ->where('purpose', $purpose)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }

    public function incrementAttempts(OtpCode $otp): OtpCode
    {
        $otp->increment('attempts');
        return $otp->fresh();
    }

    public function markConsumed(OtpCode $otp): OtpCode
    {
        $otp->update(['consumed_at' => now()]);
        return $otp->fresh();
    }

    public function invalidateExisting(string $email, string $purpose): void
    {
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
        return OtpCode::where('expires_at', '<', now())
            ->orWhereNotNull('consumed_at')
            ->delete();
    }
}
