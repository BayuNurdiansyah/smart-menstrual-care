<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload satu gambar (untuk ilustrasi langkah / galeri materi).
     * Disimpan di disk "public" -> dapat diakses via /storage/...
     * Mengembalikan path (disimpan ke DB) dan url (untuk preview).
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:4096'],
        ]);

        $path = $request->file('image')->store('materials', 'public');

        return response()->json([
            'path' => $path,
            'url'  => Storage::url($path),
        ], 201);
    }
}
