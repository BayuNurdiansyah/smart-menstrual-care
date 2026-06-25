<?php

namespace App\Repositories\Contracts;

use App\Models\Material;
use Illuminate\Support\Collection;

interface MaterialRepositoryInterface
{
    public function findById(int $id): ?Material;

    /** Materi terpublikasi pada sebuah tahap, terurut. */
    public function publishedByStage(int $stageId): Collection;

    /** Semua materi pada sebuah tahap (termasuk draft) untuk admin. */
    public function allByStage(int $stageId): Collection;

    public function create(array $data): Material;

    public function update(Material $material, array $data): Material;

    public function delete(Material $material): void;

    // ── Pengaturan urutan (order) ───────────────────────────────────────────
    /** Naikkan +1 semua order >= $fromOrder pada satu tahap (untuk sisipan). */
    public function incrementOrdersFrom(int $stageId, int $fromOrder, ?int $excludeId = null): void;

    /** Turunkan -1 semua order > $afterOrder pada satu tahap (untuk menutup celah). */
    public function decrementOrdersAfter(int $stageId, int $afterOrder): void;

    /** Geser order dalam rentang [min,max] sebesar $delta, kecuali $excludeId. */
    public function shiftOrderRange(int $stageId, int $minOrder, int $maxOrder, int $delta, int $excludeId): void;

    // ── Langkah & gambar materi ─────────────────────────────────────────────
    /** Ganti seluruh langkah materi dengan data baru. */
    public function syncSteps(Material $material, array $steps): void;

    /** Ganti seluruh gambar galeri materi dengan data baru. */
    public function syncImages(Material $material, array $images): void;
}
