<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'stage_id'         => $this->stage_id,
            'title'            => $this->title,
            'text_content'     => $this->text_content,
            'youtube_video_id' => $this->youtube_video_id,
            // Accessor di Model -> URL siap pakai untuk <iframe>.
            'youtube_embed_url' => $this->youtube_embed_url,
            'order'            => $this->order,
            'is_published'     => (bool) $this->is_published,
            // Langkah berilustrasi (opsional) + galeri gambar (opsional).
            'steps'  => $this->whenLoaded('steps', fn () => $this->steps->map(fn ($s) => [
                'id'        => $s->id,
                'order'     => $s->order,
                'text'      => $s->text,
                'image_url' => $s->image_url,
                'image_path' => $s->image_path,
            ])->values()),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id'        => $img->id,
                'order'     => $img->order,
                'image_url' => $img->image_url,
                'image_path' => $img->image_path,
                'caption'   => $img->caption,
            ])->values()),
        ];
    }
}
