<?php

namespace App\Repositories;

use App\Models\Stage;
use App\Models\StageProgress;
use App\Models\User;
use App\Repositories\Contracts\StageRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentStageRepository implements StageRepositoryInterface
{
    public function allOrdered(bool $withMaterials = false): Collection
    {
        $query = Stage::orderBy('order');

        if ($withMaterials) {
            $query->with(['materials' => fn ($q) => $q->where('is_published', true)->orderBy('order')]);
        }

        return $query->get();
    }

    public function findBySlug(string $slug): ?Stage
    {
        return Stage::where('slug', $slug)->first();
    }

    public function findById(int $id): ?Stage
    {
        return Stage::find($id);
    }

    public function upsertProgress(User $student, Stage $stage, string $status): void
    {
        StageProgress::updateOrCreate(
            ['user_id' => $student->id, 'stage_id' => $stage->id],
            [
                'status'       => $status,
                'completed_at' => $status === 'completed' ? now() : null,
            ]
        );
    }

    public function progressForStudent(User $student): Collection
    {
        return StageProgress::where('user_id', $student->id)
            ->with('stage')
            ->get();
    }
}
