<?php

namespace App\Enums;

enum GameType: string
{
    case MemoryCard = 'memory_card';

    public function label(): string
    {
        return match ($this) {
            self::MemoryCard => 'Memory Card',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $g) => $g->value, self::cases());
    }
}
