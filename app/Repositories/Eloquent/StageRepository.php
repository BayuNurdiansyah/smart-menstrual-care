<?php

namespace App\Repositories\Eloquent;

use App\Models\Stage;
use App\Models\User;
use App\Repositories\Contracts\StageRepositoryInterface;
use Illuminate\Support\Collection;

class StageRepository implements StageRepositoryInterface
{
    public function allOrdered(bool $withMaterials = false): Collection
    {
        return Stage::query()
            // Eager load hanya materi terpublikasi -> hindari N+1.
            ->when($withMaterials, fn ($q) => $q->with([
                'materials' => fn ($m) => $m->where('is_published', true),
            ]))
            ->orderBy('order')
            ->get();
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
        $student->stageProgress()->updateOrCreate(
            ['stage_id' => $stage->id],
            [
                'status'       => $status,
                'completed_at' => $status === 'completed' ? now() : null,
            ]
        );
    }

    public function progressForStudent(User $student): Collection
    {
        return $student->stageProgress()
            ->with('stage')
            ->get();
    }
}
