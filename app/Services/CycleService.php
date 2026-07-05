<?php

namespace App\Services;

use App\Exceptions\CycleException;
use App\Models\Cycle;
use App\Models\User;
use App\Repositories\Contracts\AssessmentRepositoryInterface;
use App\Repositories\Contracts\CycleRepositoryInterface;
use Illuminate\Support\Facades\DB;

class CycleService
{
    /** Slug tahap yang badge-nya diberikan saat siklus pertama ditutup. */
    private const HEALTHY_HABIT_SLUG = 'healthy-habit-builder';

    public function __construct(
        private readonly CycleRepositoryInterface      $cycleRepository,
        private readonly GameService                   $gameService,
        private readonly AssessmentRepositoryInterface $assessmentRepository,
    ) {
    }

    /**
     * Dipanggil tiap kali sebuah siklus DITUTUP: tandai tahap Healthy Habit
     * Builder selesai & award badge (idempotent — hanya pertama kali memberi).
     */
    private function onCycleClosed(int $userId): void
    {
        $this->gameService->completeStageBySlug($userId, self::HEALTHY_HABIT_SLUG);
    }

    /**
     * Ambil siklus berjalan milik murid.
     * Auto-close dihapus: user bertanggung jawab menutup siklus secara manual
     * lewat "Tandai Berakhir" atau combined modal koreksi tanggal.
     * Siklus yang terlalu lama terbuka akan mendapat peringatan di UI, bukan
     * ditutup paksa, sehingga input data historis tetap bisa dilakukan kapan saja.
     */
    public function getCurrentCycle(int $userId): ?Cycle
    {
        return $this->cycleRepository->ongoingForUser($userId);
    }

    /**
     * Tutup siklus berjalan pada tanggal tertentu (mis. saat murid memilih
     * "menstruasi sudah selesai" di assessment harian terakhir).
     */
    public function finishCycle(int $userId, string $endDate): ?Cycle
    {
        $cycle = $this->cycleRepository->ongoingForUser($userId);
        if ($cycle === null) {
            return null;
        }

        $closed = $this->cycleRepository->close($cycle, $endDate, auto: false);
        $this->onCycleClosed($userId);

        return $closed;
    }

    /**
     * Riwayat siklus murid (terbaru lebih dulu). Lazy-close dievaluasi
     * lebih dulu agar siklus berjalan yang sudah lewat 10 hari ikut ter-update.
     *
     * @return \Illuminate\Support\Collection<int,Cycle>
     */
    public function getHistory(User $student): \Illuminate\Support\Collection
    {
        $this->getCurrentCycle($student->id);

        return $this->cycleRepository->historyForUser($student);
    }

    /**
     * Siklus terakhir untuk ringkasan (dipakai SummaryService):
     * jalankan lazy-close dulu; jika tak ada yang berjalan, ambil yang terbaru.
     */
    public function getLatestCycle(User $student): ?Cycle
    {
        $current = $this->getCurrentCycle($student->id);

        if ($current !== null) {
            return $current;
        }

        return $this->cycleRepository->historyForUser($student)->first();
    }

    /**
     * Mulai siklus baru. Pastikan tidak ada siklus berjalan yang masih terbuka
     * (lazy-close dievaluasi lebih dulu lewat getCurrentCycle).
     */
    public function startCycle(int $userId, string $startDate, ?int $periodLength = null, ?string $notes = null): Cycle
    {
        $existing = $this->getCurrentCycle($userId);

        if ($existing !== null && $existing->status === 'ongoing') {
            throw CycleException::alreadyOngoing();
        }

        return $this->cycleRepository->create([
            'user_id'       => $userId,
            'start_date'    => $startDate,
            'period_length' => $periodLength,
            'status'        => 'ongoing',
            'auto_closed'   => false,
            'notes'         => $notes,
        ]);
    }

    /**
     * Edit riwayat siklus secara manual (mis. memperbaiki tanggal/catatan).
     * Hanya pemilik data yang boleh mengubah. Mengisi end_date berarti
     * siklus dianggap selesai (status closed, manual).
     *
     * Jika start_date atau end_date berubah, assessment pada tanggal lama
     * otomatis dipindah ke tanggal baru, dan assessment yang "terlewat"
     * (antara tanggal lama dan baru jika baru lebih maju) dihapus.
     * Operasi hanya menyentuh siklus yang bersangkutan.
     */
    public function editHistory(int $userId, int $cycleId, array $data): Cycle
    {
        $cycle = $this->cycleRepository->findById($cycleId);

        if ($cycle === null || $cycle->user_id !== $userId) {
            throw CycleException::notFound();
        }

        $payload = array_filter([
            'start_date'    => $data['start_date'] ?? null,
            'end_date'      => $data['end_date'] ?? null,
            'period_length' => $data['period_length'] ?? null,
            'notes'         => $data['notes'] ?? null,
        ], static fn ($value) => $value !== null);

        // Validasi: end_date tidak boleh lebih kecil dari start_date siklus.
        if (! empty($payload['end_date'])) {
            $effectiveStart = $payload['start_date'] ?? $cycle->start_date->toDateString();
            if ($payload['end_date'] < $effectiveStart) {
                throw CycleException::endBeforeStart();
            }
        }

        // Simpan tanggal lama sebelum diubah (untuk migrasi assessment).
        $oldStartDate = $cycle->start_date->toDateString();
        $oldEndDate   = $cycle->end_date?->toDateString();

        $isClosing = ! empty($payload['end_date']);
        if ($isClosing) {
            $payload['status']      = 'closed';
            $payload['auto_closed'] = false;
        }

        return DB::transaction(function () use ($cycle, $payload, $oldStartDate, $oldEndDate, $isClosing, $userId) {
            $updated = $this->cycleRepository->update($cycle, $payload);

            // Migrasi assessment jika start_date berubah.
            $newStartDate = $payload['start_date'] ?? null;
            if ($newStartDate !== null && $newStartDate !== $oldStartDate) {
                $this->migrateStartDateAssessments($cycle->id, $userId, $oldStartDate, $newStartDate);
            }

            // Migrasi assessment jika end_date berubah dan sebelumnya ada end_date.
            $newEndDate = $payload['end_date'] ?? null;
            if ($newEndDate !== null && $oldEndDate !== null && $newEndDate !== $oldEndDate) {
                $this->migrateEndDateAssessments($cycle->id, $userId, $oldEndDate, $newEndDate);
            }

            if ($isClosing) {
                $this->onCycleClosed($userId);
            }

            return $updated;
        });
    }

    /**
     * Migrasi assessment ketika start_date siklus dikoreksi.
     *
     * Aturan:
     * - Assessment di tanggal mulai lama dipindah ke tanggal mulai baru (menjadi day 1).
     * - Jika tanggal baru LEBIH MAJU dari tanggal lama, assessment yang berada di antara
     *   keduanya (exclusive) dihapus karena sudah "sebelum tanggal mulai" yang baru.
     * - Semua operasi hanya menyentuh cycle_id yang bersangkutan.
     * - Jika tanggal tujuan terisi oleh siklus LAIN (unique constraint), assessment
     *   lama dihapus saja tanpa dipindah agar tidak menyentuh data siklus lain.
     */
    private function migrateStartDateAssessments(int $cycleId, int $userId, string $oldStart, string $newStart): void
    {
        $oldAttempt = $this->assessmentRepository->attemptForDateInCycle($cycleId, $oldStart);

        if ($oldAttempt !== null) {
            // Cek konflik di level user (unique index user_id, assessment_date).
            $conflicting = $this->assessmentRepository->attemptForDate($userId, $newStart);

            if ($conflicting !== null && $conflicting->id !== $oldAttempt->id) {
                if ($conflicting->cycle_id === $cycleId) {
                    // Konflik dari siklus yang sama → hapus, lalu pindahkan.
                    $this->assessmentRepository->deleteAttempt($conflicting);
                    $oldAttempt->assessment_date = $newStart;
                    $oldAttempt->save();
                } else {
                    // Konflik dari siklus LAIN → jangan sentuh; hapus saja assessment lama.
                    $this->assessmentRepository->deleteAttempt($oldAttempt);
                }
            } else {
                $oldAttempt->assessment_date = $newStart;
                $oldAttempt->save();
            }
        }

        // Jika start baru lebih maju, hapus assessment siklus ini yang kini "sebelum start baru".
        if ($newStart > $oldStart) {
            $this->assessmentRepository->deleteAttemptsInRangeForCycle($cycleId, $oldStart, $newStart);
        }
    }

    /**
     * Migrasi assessment ketika end_date siklus dikoreksi.
     *
     * Aturan:
     * - Assessment di tanggal akhir lama dipindah ke tanggal akhir baru.
     * - Jika tanggal baru LEBIH MAJU dari tanggal lama, assessment yang berada di antara
     *   keduanya (exclusive) dihapus.
     * - Jika tanggal baru lebih MUNDUR, assessment lain di siklus tidak disentuh.
     * - Semua operasi hanya menyentuh cycle_id yang bersangkutan.
     * - Jika tanggal tujuan terisi oleh siklus LAIN, assessment lama dihapus tanpa dipindah.
     */
    private function migrateEndDateAssessments(int $cycleId, int $userId, string $oldEnd, string $newEnd): void
    {
        $oldAttempt = $this->assessmentRepository->attemptForDateInCycle($cycleId, $oldEnd);

        if ($oldAttempt !== null) {
            $conflicting = $this->assessmentRepository->attemptForDate($userId, $newEnd);

            if ($conflicting !== null && $conflicting->id !== $oldAttempt->id) {
                if ($conflicting->cycle_id === $cycleId) {
                    $this->assessmentRepository->deleteAttempt($conflicting);
                    $oldAttempt->assessment_date = $newEnd;
                    $oldAttempt->save();
                } else {
                    $this->assessmentRepository->deleteAttempt($oldAttempt);
                }
            } else {
                $oldAttempt->assessment_date = $newEnd;
                $oldAttempt->save();
            }
        }

        // Jika end baru lebih maju, hapus assessment siklus ini yang berada di antara keduanya.
        if ($newEnd > $oldEnd) {
            $this->assessmentRepository->deleteAttemptsInRangeForCycle($cycleId, $oldEnd, $newEnd);
        }
    }
}
