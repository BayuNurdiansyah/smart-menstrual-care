<?php

namespace App\Repositories\Contracts;

use App\Models\Stage;
use App\Models\User;
use Illuminate\Support\Collection;

interface StageRepositoryInterface
{
    /** Seluruh tahap terurut (1-4), opsional dengan materi. */
    public function allOrdered(bool $withMaterials = false): Collection;

    public function findBySlug(string $slug): ?Stage;

    public function findById(int $id): ?Stage;

    /** Catat / perbarui progress murid pada sebuah tahap. */
    public function upsertProgress(User $student, Stage $stage, string $status): void;

    /** Progress seluruh tahap untuk satu murid. */
    public function progressForStudent(User $student): Collection;
}
