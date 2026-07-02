<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Material extends Model
{
    protected $fillable = [
        'stage_id',
        'title',
        'text_content',
        'youtube_video_id',
        'audio_path',
        'order',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'order'        => 'integer',
        ];
    }

    // Tambahkan URL embed & audio siap pakai ke output JSON.
    protected $appends = ['youtube_embed_url', 'audio_url'];

    public function stage(): BelongsTo
    {
        return $this->belongsTo(Stage::class);
    }

    /** Langkah-langkah materi (berurutan, opsional berilustrasi). */
    public function steps(): HasMany
    {
        return $this->hasMany(MaterialStep::class)->orderBy('order');
    }

    /** Galeri gambar materi (berurutan). */
    public function images(): HasMany
    {
        return $this->hasMany(MaterialImage::class)->orderBy('order');
    }

    /**
     * MUTATOR: Admin boleh menempel URL YouTube format APAPUN
     * (watch, youtu.be, embed, shorts, atau ID polos). Kita simpan
     * HANYA ID video 11 karakter melalui ekstraksi Regex.
     */
    protected function youtubeVideoId(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value): ?string => $this->extractYoutubeId($value),
        );
    }

    /**
     * ACCESSOR: bangun URL embed dari ID tersimpan untuk dipakai
     * pada <iframe> di frontend React.
     */
    protected function youtubeEmbedUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->youtube_video_id
                ? 'https://www.youtube.com/embed/' . $this->youtube_video_id
                : null,
        );
    }

    /**
     * ACCESSOR: URL siap pakai (disk "public") untuk rekaman narasi materi,
     * atau null bila admin belum mengunggah audio (frontend jatuh ke TTS).
     */
    protected function audioUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->audio_path ? Storage::url($this->audio_path) : null,
        );
    }

    /**
     * Ekstrak ID video (11 karakter: huruf, angka, "-", "_") dari berbagai
     * bentuk URL YouTube. Mengembalikan null jika tidak ditemukan.
     */
    protected function extractYoutubeId(?string $input): ?string
    {
        if (blank($input)) {
            return null;
        }

        $input = trim($input);

        // Jika sudah berupa ID polos 11 karakter, langsung pakai.
        if (preg_match('/^[A-Za-z0-9_-]{11}$/', $input)) {
            return $input;
        }

        // Tangani: youtube.com/watch?v=ID, youtu.be/ID,
        // youtube.com/embed/ID, /shorts/ID, /v/ID, /live/ID.
        $pattern = '%(?:youtube(?:-nocookie)?\.com/(?:watch\?(?:[^&]*&)*v=|embed/|shorts/|live/|v/)|youtu\.be/)([A-Za-z0-9_-]{11})%i';

        if (preg_match($pattern, $input, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
