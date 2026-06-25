<?php

namespace App\Repositories\Eloquent;

use App\Enums\UserRole;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        // Email unik + ber-index, lookup tunggal yang efisien.
        return User::where('email', $email)->first();
    }

    public function matchByNameClass(string $name, string $kelas, array $roles): Collection
    {
        // Pencocokan case-insensitive & trim untuk kemudahan input.
        return User::whereIn('role', $roles)
            ->whereRaw('LOWER(TRIM(name)) = ?', [mb_strtolower(trim($name))])
            ->whereRaw('LOWER(TRIM(kelas)) = ?', [mb_strtolower(trim($kelas))])
            ->get();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->fill($data)->save();

        return $user->refresh();
    }

    public function markEmailVerified(User $user): User
    {
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user;
    }

    public function attachGuardian(User $student, User $guardian, string $guardianType): void
    {
        // syncWithoutDetaching agar idempotent (tidak menduplikasi pivot).
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
        // Filter ke murid saja; relasi pivot sudah memetakan guardian_id -> student_id.
        return $guardian->students()
            ->where('role', UserRole::Murid->value)
            ->orderBy('name')
            ->get();
    }

    public function studentsWithGuardians(): Collection
    {
        return User::where('role', UserRole::Murid->value)
            ->with('guardians')
            ->orderBy('name')
            ->get();
    }

    public function allGuardians(): Collection
    {
        return User::whereIn('role', [UserRole::Ortu->value, UserRole::Guru->value])
            ->orderBy('name')
            ->get();
    }
}
