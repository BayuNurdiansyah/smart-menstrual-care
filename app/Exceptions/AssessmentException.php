<?php

namespace App\Exceptions;

class AssessmentException extends DomainException
{
    public static function invalidAnswers(): self
    {
        return new self('Jawaban tidak lengkap atau di luar rentang yang diizinkan.');
    }

    public static function noActiveCycle(): self
    {
        $e = new self('Belum ada menstruasi yang sedang berjalan. Mulai dulu dari kalender.');
        $e->status = 422;

        return $e;
    }

    public static function invalidDate(): self
    {
        $e = new self('Tanggal assessment harus dalam rentang menstruasi (mulai s/d hari ini).');
        $e->status = 422;

        return $e;
    }
}
