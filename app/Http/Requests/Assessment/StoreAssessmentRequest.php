<?php

namespace App\Http\Requests\Assessment;

use App\Enums\AssessmentOption;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role murid dijaga di middleware
    }

    public function rules(): array
    {
        return [
            // Tanggal hari menstruasi yang diisi assessment-nya.
            'date'      => ['required', 'date'],
            // Penanda "menstruasi selesai pada hari ini" -> tutup siklus.
            'finished'  => ['nullable', 'boolean'],
            // Pemetaan { question_id: score }; validasi rentang (0-2).
            'answers'   => ['required', 'array'],
            'answers.*' => ['required', 'integer', Rule::in(AssessmentOption::values())],
        ];
    }

    /**
     * @return array<int,int>
     */
    public function answers(): array
    {
        // Pastikan key (question_id) berupa integer.
        $answers = [];
        foreach ($this->validated('answers') as $questionId => $score) {
            $answers[(int) $questionId] = (int) $score;
        }

        return $answers;
    }
}
