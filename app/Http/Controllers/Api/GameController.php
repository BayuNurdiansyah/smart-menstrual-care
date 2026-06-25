<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Game\SubmitGameScoreRequest;
use App\Services\GameService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function __construct(
        private readonly GameService $gameService,
    ) {
    }

    public function submitScore(SubmitGameScoreRequest $request): JsonResponse
    {
        $score = $this->gameService->submitScore(
            $request->user()->id,
            $request->gameType(),
            (int) $request->validated('value'),
        );

        return response()->json([
            'message' => 'Skor tersimpan.',
            'data'    => [
                'game_id'           => $score->game_id,
                'best_score'        => $score->best_score,
                'best_time_seconds' => $score->best_time_seconds,
                'plays_count'       => $score->plays_count,
            ],
        ]);
    }

    public function getBadges(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->gameService->getEarnedBadges($request->user()->id),
        ]);
    }
}
