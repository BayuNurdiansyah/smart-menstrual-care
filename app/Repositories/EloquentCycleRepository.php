<?php

namespace App\Repositories;

use App\Models\Cycle;
use App\Models\User;
use App\Repositories\Contracts\CycleRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentCycleRepository implements CycleRepositoryInterface
{
    public function findById(int $id): ?Cycle
    {
        return Cycle::find($id);
    }

    public function ongoingForUser(int $userId): ?Cycle
    {
        return Cycle::where('user_id', $userId)
            ->where('status', 'ongoing')
            ->latest('start_date')
            ->first();
    }

    public function historyForUser(User $user): Collection
    {
        return Cycle::where('user_id', $user->id)
            ->with('logs')
            ->latest('start_date')
            ->get();
    }

    public function create(array $data): Cycle
    {
        return Cycle::create($data);
    }

    public function update(Cycle $cycle, array $data): Cycle
    {
        $cycle->update($data);
        return $cycle->fresh();
    }

    public function close(Cycle $cycle, string $endDate, bool $auto = false): Cycle
    {
        $start  = \Carbon\Carbon::parse($cycle->start_date);
        $end    = \Carbon\Carbon::parse($endDate);
        $length = $start->diffInDays($end) + 1;

        $cycle->update([
            'end_date'      => $endDate,
            'status'        => 'closed',
            'period_length' => $length,
            'auto_closed'   => $auto,
        ]);

        return $cycle->fresh();
    }
}
