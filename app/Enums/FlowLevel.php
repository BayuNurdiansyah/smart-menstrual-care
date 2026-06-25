<?php

namespace App\Enums;

enum FlowLevel: string
{
    case Light  = 'light';
    case Medium = 'medium';
    case Heavy  = 'heavy';

    public function label(): string
    {
        return match ($this) {
            self::Light  => 'Sedikit',
            self::Medium => 'Sedang',
            self::Heavy  => 'Banyak',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $f) => $f->value, self::cases());
    }
}
