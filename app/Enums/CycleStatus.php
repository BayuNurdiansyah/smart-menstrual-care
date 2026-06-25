<?php

namespace App\Enums;

enum CycleStatus: string
{
    case Ongoing = 'ongoing';
    case Closed  = 'closed';

    public static function values(): array
    {
        return array_map(fn (self $s) => $s->value, self::cases());
    }
}
