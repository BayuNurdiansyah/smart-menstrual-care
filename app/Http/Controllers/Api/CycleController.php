<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cycle\StartCycleRequest;
use App\Http\Requests\Cycle\UpdateCycleRequest;
use App\Http\Resources\CycleResource;
use App\Services\CycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CycleController extends Controller
{
    public function __construct(
        private readonly CycleService $cycleService,
    ) {
    }

    public function getCurrentCycle(Request $request): JsonResponse
    {
        // Lazy auto-close dievaluasi di dalam service.
        $cycle = $this->cycleService->getCurrentCycle($request->user()->id);

        return response()->json([
            'data' => $cycle ? new CycleResource($cycle) : null,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        return response()->json([
            'data' => CycleResource::collection(
                $this->cycleService->getHistory($request->user())
            ),
        ]);
    }

    public function startCycle(StartCycleRequest $request): JsonResponse
    {
        $cycle = $this->cycleService->startCycle(
            $request->user()->id,
            $request->validated('start_date'),
            $request->validated('period_length'),
            $request->validated('notes'),
        );

        return (new CycleResource($cycle))
            ->response()
            ->setStatusCode(201);
    }

    public function editHistory(UpdateCycleRequest $request, int $cycle): CycleResource
    {
        $updated = $this->cycleService->editHistory(
            $request->user()->id,
            $cycle,
            $request->validated(),
        );

        return new CycleResource($updated);
    }
}
