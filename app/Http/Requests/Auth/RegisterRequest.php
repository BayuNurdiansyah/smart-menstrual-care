<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // endpoint publik
    }

    public function rules(): array
    {
        $role = $this->input('role', UserRole::Murid->value);
        $isGuardianSimple = in_array($role, [UserRole::Murid->value, UserRole::Ortu->value], true);

        return [
            'name'            => ['required', 'string', 'max:100'],
            'email'           => ['required', 'email', 'max:150', 'unique:users,email'],
            // Password wajib untuk guru (admin diblokir publik); murid/ortu tanpa password.
            'password'        => [$isGuardianSimple ? 'prohibited' : 'required', 'string', 'min:8', 'confirmed'],
            // Role opsional; Admin akan ditolak/di-downgrade di AuthService.
            'role'            => ['nullable', Rule::in(UserRole::values())],
            // Kelas wajib untuk murid/ortu (dipakai login), tak relevan untuk guru.
            'kelas'           => [$isGuardianSimple ? 'required' : 'nullable', 'string', 'max:50'],
            'date_of_birth'   => ['nullable', 'date', 'before:today'],
            'region'          => ['nullable', 'string', 'max:255'],
            // Opsi A: murid boleh menautkan pengawas lewat email saat daftar.
            'guardian_email'  => ['nullable', 'email', 'max:150'],
        ];
    }
}
