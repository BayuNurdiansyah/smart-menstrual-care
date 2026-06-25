<?php

namespace App\Exceptions;

class CycleException extends DomainException
{
    public static function alreadyOngoing(): self
    {
        return new self('Masih ada siklus yang sedang berjalan. Tutup dulu sebelum memulai yang baru.');
    }

    public static function notFound(): self
    {
        $e = new self('Data siklus tidak ditemukan.');
        $e->status = 404;

        return $e;
    }
}
