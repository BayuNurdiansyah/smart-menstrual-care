<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Stage extends Model
{
    protected $fillable = [
        'slug',
        'title',
        'description',
        'order',
        'icon',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
        ];
    }

    public function materials(): HasMany
    {
        return $this->hasMany(Material::class)->orderBy('order');
    }

    public function badge(): HasOne
    {
        return $this->hasOne(Badge::class);
    }

    public function games(): HasMany
    {
        return $this->hasMany(Game::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(StageProgress::class);
    }
}
