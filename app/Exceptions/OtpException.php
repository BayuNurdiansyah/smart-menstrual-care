<?php

namespace App\Exceptions;

class OtpException extends DomainException
{
    public static function invalidCode(): self
    {
        return new self('Kode OTP salah atau sudah kedaluwarsa.');
    }

    public static function tooManyAttempts(int $retryAfter): self
    {
        $e = new self('Terlalu banyak percobaan. Coba lagi nanti.');
        $e->status = 429; // Too Many Requests
        $e->retryAfter = $retryAfter;

        return $e;
    }

    public static function resendCooldown(int $retryAfter): self
    {
        $e = new self('Mohon tunggu sebelum meminta kode baru.');
        $e->status = 429;
        $e->retryAfter = $retryAfter;

        return $e;
    }
}
