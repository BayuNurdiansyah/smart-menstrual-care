<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assessment\StoreAssessmentRequest;
use App\Services\AssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function __construct(
        private readonly AssessmentService $assessmentService,
    ) {
    }

    public function questions(): JsonResponse
    {
        return response()->json([
            'data' => $this->assessmentService->getActiveQuestions(),
        ]);
    }

    /** Status assessment harian untuk siklus berjalan (tanggal sudah/belum diisi). */
    public function dailyStatus(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->assessmentService->getDailyStatus($request->user()->id),
        ]);
    }

    /** Simpan assessment harian; bila finished=true, siklus ditutup pada tanggal itu. */
    public function store(StoreAssessmentRequest $request): JsonResponse
    {
        $result = $this->assessmentService->submitDailyAssessment(
            $request->user()->id,
            $request->validated('date'),
            $request->answers(),
            (bool) $request->validated('finished'),
        );

        return response()->json([
            'message' => $result['cycle_closed']
                ? 'Assessment tersimpan. Menstruasi ditandai selesai.'
                : 'Assessment harian tersimpan.',
            'data'    => $result,
        ], 201);
    }

    public function getChartData(Request $request): JsonResponse
    {
        $chart = $this->assessmentService->getFormattedChartData($request->user()->id);

        return response()->json(['data' => $chart]);
    }
}
