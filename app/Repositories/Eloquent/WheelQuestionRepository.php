<?php

namespace App\Repositories\Eloquent;

use App\Models\WheelQuestion;
use App\Repositories\Contracts\WheelQuestionRepositoryInterface;
use Illuminate\Support\Collection;

class WheelQuestionRepository implements WheelQuestionRepositoryInterface
{
    public function activeByStage(int $stageId): Collection
    {
        return WheelQuestion::where('stage_id', $stageId)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function all(): Collection
    {
        return WheelQuestion::orderBy('stage_id')->orderBy('order')->get();
    }

    public function findById(int $id): ?WheelQuestion
    {
        return WheelQuestion::find($id);
    }

    public function create(array $data): WheelQuestion
    {
        return WheelQuestion::create($data);
    }

    public function update(WheelQuestion $question, array $data): WheelQuestion
    {
        $question->fill($data)->save();

        return $question->refresh();
    }

    public function delete(WheelQuestion $question): void
    {
        $question->delete();
    }
}
