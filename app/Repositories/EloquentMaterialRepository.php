<?php

namespace App\Repositories;

use App\Models\Material;
use App\Repositories\Contracts\MaterialRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentMaterialRepository implements MaterialRepositoryInterface
{
    public function findById(int $id): ?Material
    {
        return Material::find($id);
    }

    public function publishedByStage(int $stageId): Collection
    {
        return Material::where('stage_id', $stageId)
            ->where('is_published', true)
            ->orderBy('order')
            ->get();
    }

    public function create(array $data): Material
    {
        return Material::create($data);
    }

    public function update(Material $material, array $data): Material
    {
        $material->update($data);
        return $material->fresh();
    }

    public function delete(Material $material): void
    {
        $material->delete();
    }
}
