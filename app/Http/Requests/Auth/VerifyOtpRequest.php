<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // OTP kini hanya untuk verifikasi REGISTER.
        return [
            'email' => ['required', 'email'],
            'code'  => ['required', 'string', 'digits:6'],
        ];
    }
}
