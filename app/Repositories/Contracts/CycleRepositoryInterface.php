<?php

namespace App\Repositories\Contracts;

use App\Models\Cycle;
use App\Models\User;
use Illuminate\Support\Collection;

interface CycleRepositoryInterface
{
    public function findById(int $id): ?Cycle;

    /** Siklus yang masih berstatus 'ongoing' milik murid (untuk lazy auto-close). */
    public function ongoingForUser(int $userId): ?Cycle;

    /** Riwayat siklus murid, terbaru lebih dulu. */
    public function historyForUser(User $user): Collection;

    public function create(array $data): Cycle;

    public function update(Cycle $cycle, array $data): Cycle;

    /** Tutup siklus (set end_date, status, dan flag auto_closed bila perlu). */
    public function close(Cycle $cycle, string $endDate, bool $auto = false): Cycle;

    /**
     * Temukan siklus (ongoing atau closed) milik user yang date range-nya
     * mencakup tanggal tertentu (start_date <= date <= end_date).
     * Dipakai untuk mengisi assessment pada siklus yang sudah ditutup.
     */
    public function findForDate(int $userId, string $date): ?Cycle;
}
