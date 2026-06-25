<?php

namespace App\Repositories;

use App\Models\GameScore;
use App\Models\User;
use App\Repositories\Contracts\GameScoreRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentGameScoreRepository implements GameScoreRepositoryInterface
{
    public function findForUserGame(int $userId, int $gameId): ?GameScore
    {
        return GameScore::where('user_id', $userId)
            ->where('game_id', $gameId)
            ->first();
    }

    public function upsertBest(int $userId, int $gameId, int $score, ?int $timeSeconds): GameScore
    {
        $existing = $this->findForUserGame($userId, $gameId);

        if (! $existing) {
            return GameScore::create([
                'user_id'           => $userId,
                'game_id'           => $gameId,
                'best_score'        => $score,
                'best_time_seconds' => $timeSeconds,
                'plays_count'       => 1,
            ]);
        }

        $updates = ['plays_count' => $existing->plays_count + 1];

        // Perbarui skor hanya jika lebih tinggi
        if ($score > $existing->best_score) {
            $updates['best_score'] = $score;
        }

        // Perbarui waktu hanya jika lebih cepat (lebih kecil)
        if ($timeSeconds !== null && ($existing->best_time_seconds === null || $timeSeconds < $existing->best_time_seconds)) {
            $updates['best_time_seconds'] = $timeSeconds;
        }

        $existing->update($updates);
        return $existing->fresh();
    }

    public function forUser(User $user): Collection
    {
        return GameScore::where('user_id', $user->id)
            ->with('game')
            ->get();
    }
}
