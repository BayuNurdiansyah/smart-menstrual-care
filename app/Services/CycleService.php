<?php

namespace App\Services;

use App\Exceptions\CycleException;
use App\Models\Cycle;
use App\Models\User;
use App\Repositories\Contracts\CycleRepositoryInterface;
use Illuminate\Support\Carbon;

class CycleService
{
    /**
     * Batas maksimal lama satu siklus haid (hari). Lebih dari ini,
     * siklus dianggap lupa ditutup dan akan di-auto-close.
     */
    private const MAX_PERIOD_DAYS = 10;

    public function __construct(
        private readonly CycleRepositoryInterface $cycleRepository,
    ) {
    }

    /**
     * Ambil siklus berjalan milik murid dengan LAZY EVALUATION:
     * dievaluasi saat dibaca (bukan Cron). Jika siklus yang masih terbuka
     * (end_date null) sudah melewati MAX_PERIOD_DAYS sejak start_date,
     * tutup otomatis pada hari ke-10 lalu kembalikan data ter-update.
     */
    public function getCurrentCycle(int $userId): ?Cycle
    {
        $cycle = $this->cycleRepository->ongoingForUser($userId);

        if ($cycle === null) {
            return null;
        }

        if ($cycle->end_date === null) {
            $elapsedDays = $cycle->start_date->diffInDays(Carbon::today());

            if ($elapsedDays > self::MAX_PERIOD_DAYS) {
                // Tutup pada hari ke-10 dari start_date, tandai auto-closed.
                $autoEndDate = $cycle->start_date->copy()->addDays(self::MAX_PERIOD_DAYS);

                $cycle = $this->cycleRepository->close(
                    $cycle,
                    $autoEndDate->toDateString(),
                    auto: true
                );
            }
        }

        return $cycle;
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

        return $this->cycleRepository->close($cycle, $endDate, auto: false);
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

        // Penutupan manual: end_date diisi -> status closed, bukan auto.
        if (! empty($payload['end_date'])) {
            $payload['status'] = 'closed';
            $payload['auto_closed'] = false;
        }

        return $this->cycleRepository->update($cycle, $payload);
    }
}
