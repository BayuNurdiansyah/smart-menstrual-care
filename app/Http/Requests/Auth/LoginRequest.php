<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Dua jalur: (email+password) untuk admin/guru, atau (nama+kelas) untuk murid/ortu.
        // Validasi kombinasi final ditangani di controller.
        return [
            'email'    => ['nullable', 'email'],
            'password' => ['nullable', 'string'],
            'name'     => ['nullable', 'string', 'max:100'],
            'kelas'    => ['nullable', 'string', 'max:50'],
        ];
    }
}
