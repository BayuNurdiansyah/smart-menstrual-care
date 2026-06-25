<?php

namespace App\Http\Controllers\Api\Guardian;

use App\Http\Controllers\Controller;
use App\Services\SummaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SummaryController extends Controller
{
    public function __construct(
        private readonly SummaryService $summaryService,
    ) {
    }

    public function students(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->summaryService->getSupervisedStudents($request->user()),
        ]);
    }

    public function getStudentSummary(Request $request, int $student): JsonResponse
    {
        // Otorisasi: pengawas hanya boleh melihat murid yang ia dampingi.
        $isSupervising = $request->user()
            ->students()
            ->whereKey($student)
            ->exists();

        abort_unless($isSupervising, 403, 'Anda bukan pengawas murid ini.');

        return response()->json([
            'data' => $this->summaryService->getStudentSummary($student)->toArray(),
        ]);
    }
}
