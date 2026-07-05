<?php

namespace App\Repositories\Eloquent;

use App\Enums\CycleStatus;
use App\Models\Cycle;
use App\Models\User;
use App\Repositories\Contracts\CycleRepositoryInterface;
use Illuminate\Support\Collection;

class CycleRepository implements CycleRepositoryInterface
{
    public function findById(int $id): ?Cycle
    {
        return Cycle::find($id);
    }

    public function ongoingForUser(int $userId): ?Cycle
    {
        // Index (user_id, status) dipakai; ambil siklus berjalan paling baru.
        return Cycle::where('user_id', $userId)
            ->where('status', CycleStatus::Ongoing->value)
            ->latest('start_date')
            ->first();
    }

    public function historyForUser(User $user): Collection
    {
        return $user->cycles()
            ->orderByDesc('start_date')
            ->get();
    }

    public function create(array $data): Cycle
    {
        return Cycle::create($data);
    }

    public function update(Cycle $cycle, array $data): Cycle
    {
        $cycle->fill($data)->save();

        return $cycle->refresh();
    }

    public function close(Cycle $cycle, string $endDate, bool $auto = false): Cycle
    {
        $cycle->fill([
            'end_date'    => $endDate,
            'status'      => CycleStatus::Closed->value,
            'auto_closed' => $auto,
        ])->save();

        return $cycle->refresh();
    }

    public function findForDate(int $userId, string $date): ?Cycle
    {
        return Cycle::where('user_id', $userId)
            ->whereDate('start_date', '<=', $date)
            ->where(function ($q) use ($date) {
                // Siklus ongoing (end_date null) atau closed yang mencakup tanggal ini
                $q->whereNull('end_date')
                  ->orWhereDate('end_date', '>=', $date);
            })
            ->latest('start_date')
            ->first();
    }
}
