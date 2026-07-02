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

    /**
     * Upload satu rekaman narasi (MP3/WAV/M4A) untuk sebuah materi.
     * Disimpan di disk "public" -> dapat diakses via /storage/...
     * Mengembalikan path (disimpan ke DB) dan url (untuk preview/putar).
     */
    public function storeAudio(Request $request): JsonResponse
    {
        $request->validate([
            'audio' => ['required', 'file', 'mimes:mp3,mpga,wav,m4a,ogg', 'max:20480'],
        ]);

        $path = $request->file('audio')->store('materials/audio', 'public');

        return response()->json([
            'path' => $path,
            'url'  => Storage::url($path),
        ], 201);
    }

    public function destroyAudio(Request $request): JsonResponse
    {
        $request->validate([
            'path' => ['required', 'string'],
        ]);

        $path = $request->input('path');

        if (!str_starts_with($path, 'materials/audio/')) {
            return response()->json(['message' => 'Path tidak valid.'], 422);
        }

        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        Storage::disk('public')->delete($path);

        return response()->json(['message' => 'Audio berhasil dihapus.']);
    }
}
