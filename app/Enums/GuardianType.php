<?php

namespace App\Enums;

enum GuardianType: string
{
    case Ortu = 'ortu';
    case Guru = 'guru';

    public function label(): string
    {
        return match ($this) {
            self::Ortu => 'Orang Tua',
            self::Guru => 'Guru',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $t) => $t->value, self::cases());
    }
}
