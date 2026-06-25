<?php

namespace App\DTOs;

/**
 * Ringkasan murid untuk dashboard Ortu/Guru.
 * Immutable; mudah di-serialize ke JSON oleh Controller nanti.
 */
final readonly class StudentSummaryData
{
    public function __construct(
        public int $studentId,
        public string $studentName,
        /** @var array<string,mixed>|null Riwayat siklus terakhir (atau null). */
        public ?array $lastCycle,
        /** @var array<string,mixed> Data siap-Recharts dari AssessmentService. */
        public array $chart,
        /** @var array<int,array<string,mixed>> Badge yang sudah dikumpulkan. */
        public array $badges,
    ) {
    }

    public function toArray(): array
    {
        return [
            'student_id'   => $this->studentId,
            'student_name' => $this->studentName,
            'last_cycle'   => $this->lastCycle,
            'chart'        => $this->chart,
            'badges'       => $this->badges,
        ];
    }
}
