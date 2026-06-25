<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameScore extends Model
{
    protected $fillable = [
        'user_id',
        'game_id',
        'best_score',
        'best_time_seconds',
        'plays_count',
    ];

    protected function casts(): array
    {
        return [
            'best_score'        => 'integer',
            'best_time_seconds' => 'integer',
            'plays_count'       => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }
}
