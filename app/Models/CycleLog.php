<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CycleLog extends Model
{
    protected $fillable = [
        'cycle_id',
        'log_date',
        'flow_level',
        'symptoms',
        'mood',
    ];

    protected function casts(): array
    {
        return [
            'log_date' => 'date',
            'symptoms' => 'array', // disimpan sebagai JSON/TEXT di SQLite
        ];
    }

    public function cycle(): BelongsTo
    {
        return $this->belongsTo(Cycle::class);
    }
}
