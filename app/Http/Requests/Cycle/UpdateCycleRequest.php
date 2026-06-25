<?php

namespace App\Http\Requests\Cycle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date'    => ['sometimes', 'date', 'before_or_equal:today'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            'period_length' => ['nullable', 'integer', 'min:1', 'max:15'],
            'notes'         => ['nullable', 'string', 'max:500'],
        ];
    }
}
