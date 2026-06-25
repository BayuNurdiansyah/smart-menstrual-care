<?php

namespace App\Repositories\Eloquent;

use App\Models\GameScore;
use App\Models\User;
use App\Repositories\Contracts\GameScoreRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GameScoreRepository implements GameScoreRepositoryInterface
{
    public function findForUserGame(int $userId, int $gameId): ?GameScore
    {
        // Didukung unique index (user_id, game_id).
        return GameScore::where('user_id', $userId)
            ->where('game_id', $gameId)
            ->first();
    }

    public function updateIfBetter(int $userId, int $gameId, int $score, ?int $timeSeconds): GameScore
    {
        // Bungkus dengan transaksi agar baca-tulis rekor konsisten.
        return DB::transaction(function () use ($userId, $gameId, $score, $timeSeconds) {
            $row = GameScore::where('user_id', $userId)
                ->where('game_id', $gameId)
                ->lockForUpdate()
                ->first();

            if (! $row) {
                return GameScore::create([
                    'user_id'           => $userId,
                    'game_id'           => $gameId,
                    'best_score'        => $score,
                    'best_time_seconds' => $timeSeconds,
                    'plays_count'       => 1,
                ]);
            }

            // Hanya tulis bila benar-benar rekor baru.
            if ($score > $row->best_score) {
                $row->best_score = $score;
            }

            if ($timeSeconds !== null
                && ($row->best_time_seconds === null || $timeSeconds < $row->best_time_seconds)) {
                $row->best_time_seconds = $timeSeconds;
            }

            $row->plays_count++;
            $row->save();

            return $row->refresh();
        });
    }

    public function forUser(User $user): Collection
    {
        return $user->gameScores()
            ->with('game')
            ->get();
    }
}
