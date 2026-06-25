<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MaterialStep extends Model
{
    protected $fillable = ['material_id', 'order', 'text', 'image_path'];

    protected $casts = ['order' => 'integer'];

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class);
    }

    /** URL publik ilustrasi langkah (null bila tidak ada). */
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->image_path ? Storage::url($this->image_path) : null,
        );
    }
}
