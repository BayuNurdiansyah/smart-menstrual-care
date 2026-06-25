<?php

namespace App\Repositories\Contracts;

use App\Models\GameScore;
use App\Models\User;
use Illuminate\Support\Collection;

interface GameScoreRepositoryInterface
{
    public function findForUserGame(int $userId, int $gameId): ?GameScore;

    /**
     * Simpan hasil bermain; implementasi hanya menulis bila ini rekor baru
     * (skor lebih tinggi / waktu lebih cepat) dan menaikkan plays_count.
     */
    public function updateIfBetter(int $userId, int $gameId, int $score, ?int $timeSeconds): GameScore;

    /** Seluruh skor terbaik milik seorang murid. */
    public function forUser(User $user): Collection;
}
