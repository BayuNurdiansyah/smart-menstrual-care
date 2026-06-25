<?php

namespace App\Repositories\Eloquent;

use App\Enums\GameType;
use App\Models\Game;
use App\Repositories\Contracts\GameRepositoryInterface;
use Illuminate\Support\Collection;

class GameRepository implements GameRepositoryInterface
{
    public function findById(int $id): ?Game
    {
        return Game::find($id);
    }

    public function findBySlug(string $slug): ?Game
    {
        return Game::where('slug', $slug)->first();
    }

    public function findByType(GameType $type): ?Game
    {
        // Catatan: bila satu tipe punya banyak game, ambil yang pertama.
        return Game::where('type', $type->value)->first();
    }

    public function all(): Collection
    {
        return Game::orderBy('id')->get();
    }
}
