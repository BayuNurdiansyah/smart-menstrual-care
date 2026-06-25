<?php

namespace App\Exceptions;

class GameException extends DomainException
{
    public static function unknownGame(): self
    {
        $e = new self('Jenis permainan tidak dikenali.');
        $e->status = 404;

        return $e;
    }
}
