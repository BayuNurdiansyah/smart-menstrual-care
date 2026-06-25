<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cycle extends Model
{
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'period_length',
        'cycle_length',
        'status',
        'auto_closed',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date'    => 'date',
            'end_date'      => 'date',
            'period_length' => 'integer',
            'cycle_length'  => 'integer',
            'auto_closed'   => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(CycleLog::class)->orderBy('log_date');
    }

    public function isOngoing(): bool
    {
        return $this->status === 'ongoing';
    }
}
