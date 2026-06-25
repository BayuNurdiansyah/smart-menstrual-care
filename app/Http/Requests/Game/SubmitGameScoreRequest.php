<?php

namespace App\Http\Requests\Game;

use App\Enums\GameType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitGameScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role murid dijaga di middleware
    }

    public function rules(): array
    {
        return [
            'game_type' => ['required', Rule::in(GameType::values())],
            // Skor (memory_card). Interpretasi di Service.
            'value'     => ['required', 'integer', 'min:0'],
        ];
    }

    public function gameType(): GameType
    {
        return GameType::from($this->validated('game_type'));
    }
}
