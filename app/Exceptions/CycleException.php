<?php

namespace App\Exceptions;

class CycleException extends DomainException
{
    public static function alreadyOngoing(): self
    {
        $e = new self('Masih ada siklus yang sedang berjalan. Tutup dulu sebelum memulai yang baru.');
        $e->errorCode = 'already_ongoing';
        $e->status    = 409;

        return $e;
    }

    public static function notFound(): self
    {
        $e = new self('Data siklus tidak ditemukan.');
        $e->status = 404;

        return $e;
    }

    public static function endBeforeStart(): self
    {
        $e = new self('Tanggal berakhir tidak boleh lebih kecil dari tanggal mulai menstruasi.');
        $e->status = 422;

        return $e;
    }
}
