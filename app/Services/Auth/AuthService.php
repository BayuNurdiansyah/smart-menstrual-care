<?php

namespace App\Services\Auth;

use App\Enums\OtpPurpose;
use App\Enums\UserRole;
use App\Exceptions\AuthException;
use App\Exceptions\OtpException;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly OtpService $otpService,
    ) {
    }

    /**
     * Registrasi user baru.
     * - Password dienkripsi di sini (Hash::make); cast 'hashed' di Model
     *   mendeteksi nilai sudah ter-hash sehingga tidak di-hash ganda.
     * - Role ditentukan & dibatasi (registrasi publik tidak boleh membuat Admin).
     * - Memicu OtpService untuk verifikasi email.
     */
    public function register(array $data): User
    {
        if ($this->userRepository->findByEmail($data['email']) !== null) {
            throw AuthException::emailTaken();
        }

        $role = $this->resolveRole($data['role'] ?? null);
        $usesPassword = $this->usesPasswordLogin($role);

        $user = $this->userRepository->create([
            'name'            => $data['name'],
            'email'           => $data['email'],
            // Password hanya untuk admin/guru. Murid/ortu login pakai nama+kelas.
            'password'        => $usesPassword && ! empty($data['password']) ? Hash::make($data['password']) : null,
            'role'            => $role->value,
            // Kelas hanya untuk murid/ortu (dipakai saat login).
            'kelas'           => $usesPassword ? null : ($data['kelas'] ?? null),
            'date_of_birth'   => $data['date_of_birth'] ?? null,
            'region'          => $data['region'] ?? null,
            'is_active'       => true,
        ]);

        // OPSI A: murid menautkan pengawas via email saat daftar (opsional).
        if ($role === UserRole::Murid && ! empty($data['guardian_email'])) {
            $this->linkGuardianByEmail($user, $data['guardian_email']);
        }

        // Kirim OTP untuk memverifikasi kepemilikan email.
        $this->otpService->generate($user->email, OtpPurpose::Register);

        return $user;
    }

    /**
     * Tautkan murid ke akun pengawas (ortu/guru) berdasarkan email.
     * Melempar error bila email tidak ditemukan atau bukan akun ortu/guru.
     */
    private function linkGuardianByEmail(User $student, string $guardianEmail): void
    {
        $guardian = $this->userRepository->findByEmail($guardianEmail);

        if ($guardian === null || ! in_array($guardian->role, [UserRole::Ortu->value, UserRole::Guru->value], true)) {
            throw AuthException::guardianNotFound();
        }

        $this->userRepository->attachGuardian($student, $guardian, $guardian->role);
    }

    /**
     * Selesaikan registrasi: verifikasi OTP email -> tandai email terverifikasi.
     */
    public function verifyEmail(string $email, string $code): User
    {
        if (! $this->otpService->verify($email, $code, OtpPurpose::Register)) {
            throw OtpException::invalidCode();
        }

        $user = $this->userRepository->findByEmail($email);
        if ($user === null) {
            throw AuthException::invalidCredentials();
        }

        return $this->userRepository->markEmailVerified($user);
    }

    /**
     * Login ADMIN/GURU dengan email + password (tanpa OTP).
     * Token Sanctum diterbitkan di Controller.
     */
    public function loginByPassword(string $email, string $password): User
    {
        $user = $this->userRepository->findByEmail($email);

        // Hanya akun ber-password (admin/guru) yang boleh lewat jalur ini.
        if ($user === null || blank($user->password) || ! Hash::check($password, $user->password)) {
            throw AuthException::invalidCredentials();
        }

        $this->ensureLoginable($user);

        return $user;
    }

    /**
     * Login MURID/ORTU sederhana dengan Nama + Kelas (tanpa password/OTP).
     * Dirancang untuk kemudahan pengguna disabilitas.
     */
    public function loginByNameClass(string $name, string $kelas): User
    {
        $matches = $this->userRepository->matchByNameClass(
            $name,
            $kelas,
            [UserRole::Murid->value, UserRole::Ortu->value]
        );

        if ($matches->isEmpty()) {
            throw AuthException::invalidCredentials();
        }

        // Nama+kelas harus unik agar tidak salah masuk ke akun orang lain.
        if ($matches->count() > 1) {
            throw AuthException::ambiguousLogin();
        }

        $user = $matches->first();
        $this->ensureLoginable($user);

        return $user;
    }

    /** Pastikan akun aktif dan emailnya sudah terverifikasi (lewat OTP saat daftar). */
    private function ensureLoginable(User $user): void
    {
        if (! $user->is_active) {
            throw AuthException::inactive();
        }

        if ($user->email_verified_at === null) {
            throw AuthException::notVerified();
        }
    }

    /**
     * Tentukan role yang aman dari input. Default Murid;
     * Admin tidak boleh dibuat lewat registrasi publik.
     */
    private function resolveRole(?string $role): UserRole
    {
        $resolved = UserRole::tryFrom((string) $role) ?? UserRole::Murid;

        return $resolved === UserRole::Admin ? UserRole::Murid : $resolved;
    }

    /** Role yang login pakai password (admin/guru). Sisanya pakai nama+kelas. */
    private function usesPasswordLogin(UserRole $role): bool
    {
        return in_array($role, [UserRole::Admin, UserRole::Guru], true);
    }
}
