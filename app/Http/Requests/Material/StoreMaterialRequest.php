<?php

namespace App\Http\Requests\Material;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // role admin dijaga di middleware
    }

    public function rules(): array
    {
        // Field bersifat wajib saat membuat (POST), opsional saat memperbarui.
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'stage_id'     => [$required, 'integer', 'exists:stages,id'],
            'title'        => [$required, 'string', 'max:150'],
            'text_content' => ['nullable', 'string'],
            // URL YouTube format apa pun; ID diekstrak oleh mutator Model.
            'youtube_url'  => ['nullable', 'string', 'max:255'],
            'order'        => ['nullable', 'integer', 'min:1'],
            'is_published' => ['nullable', 'boolean'],

            // Langkah berilustrasi (opsional). image_path = hasil endpoint upload.
            'steps'              => ['nullable', 'array'],
            'steps.*.text'       => ['nullable', 'string'],
            'steps.*.image_path' => ['nullable', 'string', 'max:255'],
            'steps.*.order'      => ['nullable', 'integer', 'min:1'],

            // Galeri gambar (opsional).
            'images'              => ['nullable', 'array'],
            'images.*.image_path' => ['required_with:images', 'string', 'max:255'],
            'images.*.caption'    => ['nullable', 'string', 'max:255'],
            'images.*.order'      => ['nullable', 'integer', 'min:1'],
        ];
    }
}
