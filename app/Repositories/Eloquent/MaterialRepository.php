<?php

namespace App\Repositories\Eloquent;

use App\Models\Material;
use App\Repositories\Contracts\MaterialRepositoryInterface;
use Illuminate\Support\Collection;

class MaterialRepository implements MaterialRepositoryInterface
{
    public function findById(int $id): ?Material
    {
        return Material::with(['steps', 'images'])->find($id);
    }

    public function publishedByStage(int $stageId): Collection
    {
        // Index (stage_id, order) mendukung filter + sort ini.
        return Material::with(['steps', 'images'])
            ->where('stage_id', $stageId)
            ->where('is_published', true)
            ->orderBy('order')
            ->get();
    }

    public function allByStage(int $stageId): Collection
    {
        return Material::with(['steps', 'images'])
            ->where('stage_id', $stageId)
            ->orderBy('order')
            ->get();
    }

    public function incrementOrdersFrom(int $stageId, int $fromOrder, ?int $excludeId = null): void
    {
        Material::where('stage_id', $stageId)
            ->where('order', '>=', $fromOrder)
            ->when($excludeId !== null, fn ($q) => $q->where('id', '!=', $excludeId))
            ->increment('order');
    }

    public function decrementOrdersAfter(int $stageId, int $afterOrder): void
    {
        Material::where('stage_id', $stageId)
            ->where('order', '>', $afterOrder)
            ->decrement('order');
    }

    public function shiftOrderRange(int $stageId, int $minOrder, int $maxOrder, int $delta, int $excludeId): void
    {
        Material::where('stage_id', $stageId)
            ->whereBetween('order', [$minOrder, $maxOrder])
            ->where('id', '!=', $excludeId)
            ->increment('order', $delta); // $delta bisa negatif
    }

    public function create(array $data): Material
    {
        // Mutator di Model otomatis mengekstrak ID dari URL YouTube apa pun.
        return Material::create($data);
    }

    public function update(Material $material, array $data): Material
    {
        $material->fill($data)->save();

        return $material->refresh();
    }

    public function delete(Material $material): void
    {
        $material->delete();
    }

    public function syncSteps(Material $material, array $steps): void
    {
        $material->steps()->delete();
        foreach (array_values($steps) as $i => $step) {
            if (blank($step['text'] ?? null) && blank($step['image_path'] ?? null)) {
                continue;
            }
            $material->steps()->create([
                'order'      => $step['order'] ?? $i + 1,
                'text'       => $step['text'] ?? '',
                'image_path' => $step['image_path'] ?? null,
            ]);
        }
    }

    public function syncImages(Material $material, array $images): void
    {
        $material->images()->delete();
        foreach (array_values($images) as $i => $img) {
            if (empty($img['image_path'])) {
                continue;
            }
            $material->images()->create([
                'order'      => $img['order'] ?? $i + 1,
                'image_path' => $img['image_path'],
                'caption'    => $img['caption'] ?? null,
            ]);
        }
    }
}
