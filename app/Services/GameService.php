<?php

namespace App\Services;

use App\Enums\GameType;
use App\Enums\ProgressStatus;
use App\Exceptions\GameException;
use App\Models\GameScore;
use App\Repositories\Contracts\BadgeRepositoryInterface;
use App\Repositories\Contracts\GameRepositoryInterface;
use App\Repositories\Contracts\GameScoreRepositoryInterface;
use App\Repositories\Contracts\StageRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WheelQuestionRepositoryInterface;

class GameService
{
    public function __construct(
        private readonly GameRepositoryInterface $gameRepository,
        private readonly GameScoreRepositoryInterface $gameScoreRepository,
        private readonly StageRepositoryInterface $stageRepository,
        private readonly BadgeRepositoryInterface $badgeRepository,
        private readonly UserRepositoryInterface $userRepository,
        private readonly WheelQuestionRepositoryInterface $wheelQuestionRepository,
    ) {
    }

    /**
     * Soal Roda Keberuntungan untuk sebuah tahap (dinamis, dari DB).
     *
     * @return array<int,array<string,mixed>>
     */
    public function getWheelQuestions(int $stageId): array
    {
        return $this->wheelQuestionRepository->activeByStage($stageId)
            ->map(fn ($q) => [
                'id'       => $q->id,
                'question' => $q->question,
                'options'  => ['a' => $q->option_a, 'b' => $q->option_b, 'c' => $q->option_c],
                'answer'   => $q->answer, // 'a' | 'b' | 'c' | null
            ])
            ->all();
    }

    /**
     * Simpan hasil bermain. Gameplay sepenuhnya di local state React;
     * di sini hanya menyimpan rekor terbaik via updateIfBetter().
     *
     * Game berbasis skor (memory_card): $scoreOrTime = skor (besar = lebih baik).
     */
    public function submitScore(int $userId, GameType $gameType, int $scoreOrTime): GameScore
    {
        $game = $this->gameRepository->findByType($gameType);

        if ($game === null) {
            throw GameException::unknownGame();
        }

        if ($this->isTimeBased($gameType)) {
            return $this->gameScoreRepository->updateIfBetter($userId, $game->id, 0, $scoreOrTime);
        }

        return $this->gameScoreRepository->updateIfBetter($userId, $game->id, $scoreOrTime, null);
    }

    /**
     * Tandai sebuah tahap selesai untuk murid, lalu evaluasi badge.
     * Mengembalikan badge yang BARU diberikan (kosong jika tidak ada).
     *
     * @return array<int,array<string,mixed>>
     */
    public function completeStage(int $userId, int $stageId): array
    {
        $student = $this->userRepository->findById($userId);
        $stage = $this->stageRepository->findById($stageId);

        if ($student === null || $stage === null) {
            return [];
        }

        $this->stageRepository->upsertProgress($student, $stage, ProgressStatus::Completed->value);

        return $this->evaluateLearningBadges($userId);
    }

    /**
     * Validasi pencapaian/Badges berbasis penyelesaian tahap pembelajaran.
     * Memberikan badge tiap tahap yang sudah selesai; karena badge tahap-4
     * adalah "Healthy Habit Champion", menyelesaikan keempat tahap otomatis
     * memberi badge puncak tersebut.
     *
     * @return array<int,array<string,mixed>> Badge yang BARU diberikan.
     */
    public function evaluateLearningBadges(int $userId): array
    {
        $student = $this->userRepository->findById($userId);

        if ($student === null) {
            return [];
        }

        $progress = $this->stageRepository->progressForStudent($student);
        $newlyAwarded = [];

        foreach ($progress as $entry) {
            if ($entry->status !== ProgressStatus::Completed->value) {
                continue;
            }

            $badge = $this->badgeRepository->findByStage($entry->stage_id);

            if ($badge !== null && $this->badgeRepository->awardIfAbsent($userId, $badge->id)) {
                $newlyAwarded[] = [
                    'id'   => $badge->id,
                    'slug' => $badge->slug,
                    'name' => $badge->name,
                    'icon' => $badge->icon,
                ];
            }
        }

        return $newlyAwarded;
    }

    /**
     * Badge yang sudah dikumpulkan murid (untuk profil / dashboard pengawas).
     *
     * @return array<int,array<string,mixed>>
     */
    public function getEarnedBadges(int $userId): array
    {
        return $this->badgeRepository->badgesForUser($userId)
            ->map(fn ($badge) => [
                'id'        => $badge->id,
                'slug'      => $badge->slug,
                'name'      => $badge->name,
                'icon'      => $badge->icon,
                'earned_at' => $badge->pivot->earned_at ?? null,
            ])
            ->all();
    }

    /** Saat ini semua game berbasis skor (tidak ada game berbasis waktu). */
    private function isTimeBased(GameType $gameType): bool
    {
        return false;
    }
}
