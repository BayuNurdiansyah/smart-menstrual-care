<?php

namespace App\Repositories\Contracts;

use App\Enums\GameType;
use App\Models\Game;
use Illuminate\Support\Collection;

interface GameRepositoryInterface
{
    public function findById(int $id): ?Game;

    public function findBySlug(string $slug): ?Game;

    /** Resolusi game berdasarkan tipenya (memory_card). */
    public function findByType(GameType $type): ?Game;

    public function all(): Collection;
}
