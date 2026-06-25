<?php

namespace App\Repositories\Contracts;

use App\Models\Badge;
use Illuminate\Support\Collection;

interface BadgeRepositoryInterface
{
    public function findBySlug(string $slug): ?Badge;

    /** Badge yang terkait dengan sebuah tahap. */
    public function findByStage(int $stageId): ?Badge;

    /**
     * Berikan badge ke murid bila belum dimiliki (idempotent).
     * Mengembalikan true hanya jika badge baru saja diberikan.
     */
    public function awardIfAbsent(int $userId, int $badgeId): bool;

    /** Seluruh badge yang sudah dikumpulkan murid (dengan pivot earned_at). */
    public function badgesForUser(int $userId): Collection;
}
