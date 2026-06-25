<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuardianLinkController extends Controller
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
    ) {
    }

    /** Daftar murid + pengawasnya, dan daftar pengawas yang bisa dipilih. */
    public function index(): JsonResponse
    {
        $students = $this->users->studentsWithGuardians()->map(fn ($s) => [
            'id'        => $s->id,
            'name'      => $s->name,
            'email'     => $s->email,
            'guardians' => $s->guardians->map(fn ($g) => [
                'id'    => $g->id,
                'name'  => $g->name,
                'email' => $g->email,
                'role'  => $g->role,
            ])->values(),
        ]);

        $guardians = $this->users->allGuardians()->map(fn ($g) => [
            'id'    => $g->id,
            'name'  => $g->name,
            'email' => $g->email,
            'role'  => $g->role,
        ]);

        return response()->json(['students' => $students, 'guardians' => $guardians]);
    }

    /** Tautkan seorang pengawas ke murid. */
    public function attach(Request $request, int $student): JsonResponse
    {
        $data = $request->validate([
            'guardian_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $murid = $this->users->findById($student);
        $guardian = $this->users->findById((int) $data['guardian_id']);

        abort_if($murid === null || $murid->role !== 'murid', 404, 'Murid tidak ditemukan.');
        abort_if($guardian === null || ! in_array($guardian->role, ['ortu', 'guru'], true), 422, 'Akun pengawas tidak valid.');

        $this->users->attachGuardian($murid, $guardian, $guardian->role);

        return response()->json(['message' => 'Pengawas ditautkan.']);
    }

    /** Lepas tautan pengawas dari murid. */
    public function detach(int $student, int $guardian): JsonResponse
    {
        $murid = $this->users->findById($student);
        $pengawas = $this->users->findById($guardian);

        abort_if($murid === null || $pengawas === null, 404, 'Data tidak ditemukan.');

        $this->users->detachGuardian($murid, $pengawas);

        return response()->json(['message' => 'Tautan dilepas.']);
    }
}
