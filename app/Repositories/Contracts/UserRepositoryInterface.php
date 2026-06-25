<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    /** Cari user (role tertentu) berdasarkan nama + kelas. Untuk login sederhana. */
    public function matchByNameClass(string $name, string $kelas, array $roles): Collection;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function markEmailVerified(User $user): User;

    /** Kaitkan murid dengan pengawas (ortu/guru) pada pivot. */
    public function attachGuardian(User $student, User $guardian, string $guardianType): void;

    public function detachGuardian(User $student, User $guardian): void;

    /** Daftar murid yang dipantau seorang pengawas. */
    public function studentsForGuardian(User $guardian): Collection;

    /** Semua murid beserta pengawasnya (untuk admin). */
    public function studentsWithGuardians(): Collection;

    /** Semua akun pengawas (ortu/guru) untuk dipilih admin. */
    public function allGuardians(): Collection;
}
