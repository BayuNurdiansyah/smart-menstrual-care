<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaterialResource;
use App\Services\GameService;
use App\Services\MaterialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StageController extends Controller
{
    public function __construct(
        private readonly MaterialService $materialService,
        private readonly GameService $gameService,
    ) {
    }

    /**
     * Materi terpublikasi pada sebuah tahap (untuk murid).
     * {stage} = id tahap (1-4).
     */
    public function materials(int $stage): JsonResponse
    {
        return response()->json([
            'data' => MaterialResource::collection(
                $this->materialService->listByStage($stage)
            ),
        ]);
    }

    /**
     * Soal Roda Keberuntungan untuk sebuah tahap (murid).
     */
    public function wheelQuestions(int $stage): JsonResponse
    {
        return response()->json([
            'data' => $this->gameService->getWheelQuestions($stage),
        ]);
    }

    /**
     * Tandai tahap selesai untuk murid yang sedang login, lalu evaluasi badge.
     * Mengembalikan daftar badge yang BARU diperoleh (bila ada).
     */
    public function complete(Request $request, int $stage): JsonResponse
    {
        $newBadges = $this->gameService->completeStage($request->user()->id, $stage);

        return response()->json([
            'message' => 'Tahap ditandai selesai.',
            'badges'  => $newBadges,
        ]);
    }
}
