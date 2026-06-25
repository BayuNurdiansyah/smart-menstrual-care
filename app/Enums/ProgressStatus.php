<?php

namespace App\Enums;

enum ProgressStatus: string
{
    case NotStarted = 'not_started';
    case InProgress = 'in_progress';
    case Completed  = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::NotStarted => 'Belum Dimulai',
            self::InProgress => 'Sedang Berjalan',
            self::Completed  => 'Selesai',
        };
    }

    public static function values(): array
    {
        return array_map(fn (self $s) => $s->value, self::cases());
    }
}
