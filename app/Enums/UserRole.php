<?php

namespace App\Enums;

enum UserRole: string
{
    case Murid = 'murid';
    case Ortu  = 'ortu';
    case Guru  = 'guru';
    case Admin = 'admin';

    /** Role yang tergolong pengawas (orang tua / guru). */
    public static function guardians(): array
    {
        return [self::Ortu, self::Guru];
    }

    public function label(): string
    {
        return match ($this) {
            self::Murid => 'Murid',
            self::Ortu  => 'Orang Tua',
            self::Guru  => 'Guru',
            self::Admin => 'Admin',
        };
    }

    /** Daftar nilai string untuk validasi (Rule::in). */
    public static function values(): array
    {
        return array_map(fn (self $r) => $r->value, self::cases());
    }
}
