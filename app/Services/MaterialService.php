<?php

namespace App\Services;

use App\Models\Material;
use App\Repositories\Contracts\MaterialRepositoryInterface;
use App\Repositories\Contracts\StageRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MaterialService
{
    public function __construct(
        private readonly MaterialRepositoryInterface $materialRepository,
        private readonly StageRepositoryInterface $stageRepository,
    ) {
    }

    /** Daftar materi terpublikasi pada sebuah tahap (untuk murid). */
    public function listByStage(int $stageId): Collection
    {
        return $this->materialRepository->publishedByStage($stageId);
    }

    /** Semua materi pada sebuah tahap termasuk draft (untuk admin). */
    public function listAllByStage(int $stageId): Collection
    {
        return $this->materialRepository->allByStage($stageId);
    }

    public function find(int $materialId): ?Material
    {
        return $this->materialRepository->findById($materialId);
    }

    /**
     * Buat materi baru (Admin). Hanya teks dan/atau URL YouTube.
     * Jika order bertabrakan, materi pada posisi itu dan di bawahnya digeser turun.
     */
    public function create(array $data): Material
    {
        $stage = $this->stageRepository->findById((int) ($data['stage_id'] ?? 0));
        if ($stage === null) {
            throw new RuntimeException('Tahap (stage) tidak ditemukan.');
        }

        $order = (int) ($data['order'] ?? 1);

        return DB::transaction(function () use ($stage, $order, $data) {
            // Sisipkan: geser turun semua yang menempati order ini ke bawah.
            $this->materialRepository->incrementOrdersFrom($stage->id, $order);

            $material = $this->materialRepository->create([
                'stage_id'         => $stage->id,
                'title'            => $data['title'],
                'text_content'     => $data['text_content'] ?? null,
                'youtube_video_id' => $data['youtube_url'] ?? $data['youtube_video_id'] ?? null,
                'audio_path'       => $data['audio_path'] ?? null,
                'order'            => $order,
                'is_published'     => $data['is_published'] ?? true,
            ]);

            if (array_key_exists('steps', $data)) {
                $this->materialRepository->syncSteps($material, $data['steps'] ?? []);
            }
            if (array_key_exists('images', $data)) {
                $this->materialRepository->syncImages($material, $data['images'] ?? []);
            }

            return $material->load(['steps', 'images']);
        });
    }

    /**
     * Perbarui materi (Admin), termasuk penataan ulang urutan otomatis saat
     * order/tahap diubah agar tidak ada nomor kembar.
     */
    public function update(int $materialId, array $data): Material
    {
        $material = $this->materialRepository->findById($materialId);
        if ($material === null) {
            throw new RuntimeException('Materi tidak ditemukan.');
        }

        $oldStage = (int) $material->stage_id;
        $oldOrder = (int) $material->order;
        $newStage = (int) ($data['stage_id'] ?? $oldStage);
        $newOrder = isset($data['order']) ? (int) $data['order'] : $oldOrder;

        return DB::transaction(function () use ($material, $oldStage, $oldOrder, $newStage, $newOrder, $data) {
            if ($newStage !== $oldStage) {
                // Pindah tahap: tutup celah di tahap lama, sisipkan di tahap baru.
                $this->materialRepository->decrementOrdersAfter($oldStage, $oldOrder);
                $this->materialRepository->incrementOrdersFrom($newStage, $newOrder, $material->id);
            } elseif ($newOrder !== $oldOrder) {
                // Pindah posisi dalam tahap yang sama.
                if ($newOrder < $oldOrder) {
                    // Naik: yang di [new, old-1] turun satu.
                    $this->materialRepository->shiftOrderRange($oldStage, $newOrder, $oldOrder - 1, 1, $material->id);
                } else {
                    // Turun: yang di [old+1, new] naik satu.
                    $this->materialRepository->shiftOrderRange($oldStage, $oldOrder + 1, $newOrder, -1, $material->id);
                }
            }

            $payload = array_filter([
                'stage_id'         => $newStage,
                'title'            => $data['title'] ?? null,
                'text_content'     => $data['text_content'] ?? null,
                'youtube_video_id' => $data['youtube_url'] ?? $data['youtube_video_id'] ?? null,
                'audio_path'       => $data['audio_path'] ?? null,
                'order'            => $newOrder,
                'is_published'     => $data['is_published'] ?? null,
            ], static fn ($value) => $value !== null);

            $material = $this->materialRepository->update($material, $payload);

            if (array_key_exists('steps', $data)) {
                $this->materialRepository->syncSteps($material, $data['steps'] ?? []);
            }
            if (array_key_exists('images', $data)) {
                $this->materialRepository->syncImages($material, $data['images'] ?? []);
            }

            return $material->load(['steps', 'images']);
        });
    }

    public function delete(int $materialId): void
    {
        $material = $this->materialRepository->findById($materialId);
        if ($material === null) {
            throw new RuntimeException('Materi tidak ditemukan.');
        }

        $stageId = (int) $material->stage_id;
        $order = (int) $material->order;

        DB::transaction(function () use ($material, $stageId, $order) {
            $this->materialRepository->delete($material);
            // Tutup celah agar urutan tetap rapat.
            $this->materialRepository->decrementOrdersAfter($stageId, $order);
        });
    }
}
