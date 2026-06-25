<?php

namespace App\Repositories\Eloquent;

use App\Models\Badge;
use App\Models\User;
use App\Repositories\Contracts\BadgeRepositoryInterface;
use Illuminate\Support\Collection;

class BadgeRepository implements BadgeRepositoryInterface
{
    public function findBySlug(string $slug): ?Badge
    {
        return Badge::where('slug', $slug)->first();
    }

    public function findByStage(int $stageId): ?Badge
    {
        return Badge::where('stage_id', $stageId)->first();
    }

    public function awardIfAbsent(int $userId, int $badgeId): bool
    {
        $user = User::find($userId);
        if ($user === null) {
            return false;
        }

        // Unique index (user_id, badge_id) menjamin tidak ganda;
        // cek dulu agar nilai kembalian akurat (baru / sudah ada).
        $alreadyOwned = $user->badges()
            ->where('badges.id', $badgeId)
            ->exists();

        if ($alreadyOwned) {
            return false;
        }

        $user->badges()->attach($badgeId, ['earned_at' => now()]);

        return true;
    }

    public function badgesForUser(int $userId): Collection
    {
        $user = User::find($userId);
        if ($user === null) {
            return collect();
        }

        return $user->badges()
            ->with('stage')
            ->get();
    }
}
