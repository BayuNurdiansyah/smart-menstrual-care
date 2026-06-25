<?php

namespace App\Enums;

enum OtpPurpose: string
{
    case Register = 'register';
    case Login    = 'login';
    case Reset    = 'reset';

    public static function values(): array
    {
        return array_map(fn (self $p) => $p->value, self::cases());
    }
}
