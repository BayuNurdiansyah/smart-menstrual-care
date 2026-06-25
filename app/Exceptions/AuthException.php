<?php

namespace App\Exceptions;

class AuthException extends DomainException
{
    public static function invalidCredentials(): self
    {
        $e = new self('Email atau kata sandi salah.');
        $e->status = 401; // Unauthorized

        return $e;
    }

    public static function inactive(): self
    {
        $e = new self('Akun Anda tidak aktif. Hubungi admin.');
        $e->status = 403; // Forbidden

        return $e;
    }

    public static function emailTaken(): self
    {
        $e = new self('Email sudah terdaftar.');
        $e->status = 422;

        return $e;
    }

    public static function guardianNotFound(): self
    {
        $e = new self('Email pengawas tidak ditemukan atau bukan akun Orang Tua/Guru.');
        $e->status = 422;

        return $e;
    }

    public static function ambiguousLogin(): self
    {
        $e = new self('Ada lebih dari satu akun dengan nama & kelas ini. Hubungi admin.');
        $e->status = 409;

        return $e;
    }

    public static function notVerified(): self
    {
        $e = new self('Akun belum terverifikasi. Selesaikan verifikasi OTP saat mendaftar.');
        $e->status = 403;

        return $e;
    }
}
