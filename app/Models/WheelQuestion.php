<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class WheelQuestion extends Model
{
    protected $fillable = [
        'stage_id',
        'question',
        'option_a',
        'option_b',
        'option_c',
        'answer',
        'order',
        'is_active',
        'audio_path',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order'     => 'integer',
    ];

    protected $appends = ['audio_url'];

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    protected function audioUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->audio_path ? Storage::url($this->audio_path) : null,
        );
    }
}
