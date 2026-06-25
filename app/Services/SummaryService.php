<?php

namespace App\Services;

use App\DTOs\StudentSummaryData;
use App\Enums\UserRole;
use App\Exceptions\AuthException;
use App\Models\Cycle;
use App\Repositories\Contracts\UserRepositoryInterface;

class SummaryService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly CycleService $cycleService,
        private readonly AssessmentService $assessmentService,
        private readonly GameService $gameService,
    ) {
    }

    /**
     * Daftar murid yang didampingi seorang pengawas (untuk memilih anak didik).
     *
     * @return array<int,array<string,mixed>>
     */
    public function getSupervisedStudents(\App\Models\User $guardian): array
    {
        return $this->userRepository->studentsForGuardian($guardian)
            ->map(fn ($student) => [
                'id'   => $student->id,
                'name' => $student->name,
            ])
            ->all();
    }

    /**
     * Rangkum data seorang murid untuk dashboard Ortu/Guru dengan
     * mengorkestrasi service-service domain (bukan query langsung).
     */
    public function getStudentSummary(int $studentId): StudentSummaryData
    {
        $student = $this->userRepository->findById($studentId);

        if ($student === null || $student->role !== UserRole::Murid->value) {
            throw AuthException::invalidCredentials();
        }

        // 1. Riwayat siklus terakhir (lazy-close dievaluasi di CycleService).
        $lastCycle = $this->cycleService->getLatestCycle($student);

        // 2. Data grafik kemandirian (siap-Recharts).
        $chart = $this->assessmentService->getFormattedChartData($studentId);

        // 3. Badge / pencapaian yang sudah dikumpulkan.
        $badges = $this->gameService->getEarnedBadges($studentId);

        return new StudentSummaryData(
            studentId: $student->id,
            studentName: $student->name,
            lastCycle: $this->cycleToArray($lastCycle),
            chart: $chart,
            badges: $badges,
        );
    }

    /** @return array<string,mixed>|null */
    private function cycleToArray(?Cycle $cycle): ?array
    {
        if ($cycle === null) {
            return null;
        }

        return [
            'id'            => $cycle->id,
            'start_date'    => $cycle->start_date?->toDateString(),
            'end_date'      => $cycle->end_date?->toDateString(),
            'period_length' => $cycle->period_length,
            'cycle_length'  => $cycle->cycle_length,
            'status'        => $cycle->status,
            'auto_closed'   => (bool) $cycle->auto_closed,
        ];
    }
}
