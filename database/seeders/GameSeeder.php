<?php

namespace Database\Seeders;

use App\Enums\GameType;
use App\Models\Game;
use App\Models\Stage;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    public function run(): void
    {
        // Kaitkan game ke tahap relevan (opsional); pakai slug stage.
        $stage2 = Stage::where('slug', 'understand-care')->first();

        $games = [
            [
                'slug'     => 'memory-card',
                'title'    => 'Memory Card',
                'type'     => GameType::MemoryCard->value, // skor: makin tinggi makin baik
                'stage_id' => $stage2?->id,                // Tahap 2 (Understand & Care)
            ],
        ];

        foreach ($games as $game) {
            Game::updateOrCreate(['slug' => $game['slug']], $game);
        }
    }
}
