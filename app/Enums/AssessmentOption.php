<?php

namespace App\Enums;

/**
 * Opsi jawaban assessment kemandirian (skala 0-2).
 * Nilai integer = skor yang disimpan ke assessment_answers.score.
 */
enum AssessmentOption: int
{
    case BelumBisa     = 0;
    case DenganBantuan = 1;
    case BisaSendiri   = 2;

    public function label(): string
    {
        return match ($this) {
            self::BelumBisa     => 'Belum Bisa',
            self::DenganBantuan => 'Dengan Bantuan',
            self::BisaSendiri   => 'Bisa Sendiri',
        };
    }

    public static function min(): int
    {
        return self::BelumBisa->value;
    }

    public static function max(): int
    {
        return self::BisaSendiri->value;
    }

    /** Daftar nilai skor untuk validasi (Rule::in). */
    public static function values(): array
    {
        return array_map(fn (self $o) => $o->value, self::cases());
    }

    /** Bentuk [value => label] untuk dropdown/radio di frontend. */
    public static function options(): array
    {
        return array_reduce(
            self::cases(),
            function (array $carry, self $o) {
                $carry[$o->value] = $o->label();

                return $carry;
            },
            []
        );
    }
}
