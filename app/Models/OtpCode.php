<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $fillable = [
        'email',
        'code_hash',
        'purpose',
        'expires_at',
        'consumed_at',
        'attempts',
        'last_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at'   => 'datetime',
            'consumed_at'  => 'datetime',
            'last_sent_at' => 'datetime',
            'attempts'     => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}
