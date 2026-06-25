<?php

namespace App\Repositories\Contracts;

use App\Models\WheelQuestion;
use Illuminate\Support\Collection;

interface WheelQuestionRepositoryInterface
{
    /** Soal aktif sebuah tahap, terurut. */
    public function activeByStage(int $stageId): Collection;

    /** Semua soal (untuk admin), terurut tahap & order. */
    public function all(): Collection;

    public function findById(int $id): ?WheelQuestion;

    public function create(array $data): WheelQuestion;

    public function update(WheelQuestion $question, array $data): WheelQuestion;

    public function delete(WheelQuestion $question): void;
}
