<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    public function markEmailVerified(User $user): User
    {
        $user->update(['email_verified_at' => now()]);
        return $user->fresh();
    }

    public function attachGuardian(User $student, User $guardian, string $guardianType): void
    {
        $student->guardians()->syncWithoutDetaching([
            $guardian->id => ['guardian_type' => $guardianType],
        ]);
    }

    public function detachGuardian(User $student, User $guardian): void
    {
        $student->guardians()->detach($guardian->id);
    }

    public function studentsForGuardian(User $guardian): Collection
    {
        return $guardian->students()->with('stageProgress', 'badges')->get();
    }
}
