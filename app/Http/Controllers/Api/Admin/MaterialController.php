<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Material\StoreMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Services\MaterialService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function __construct(
        private readonly MaterialService $materialService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $stageId = (int) $request->query('stage_id');

        return response()->json([
            'data' => MaterialResource::collection(
                $this->materialService->listAllByStage($stageId)
            ),
        ]);
    }

    public function show(int $material): MaterialResource
    {
        $found = $this->materialService->find($material);

        abort_if($found === null, 404, 'Materi tidak ditemukan.');

        return new MaterialResource($found);
    }

    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $material = $this->materialService->create($request->validated());

        return (new MaterialResource($material))
            ->response()
            ->setStatusCode(201);
    }

    public function update(StoreMaterialRequest $request, int $material): MaterialResource
    {
        $updated = $this->materialService->update($material, $request->validated());

        return new MaterialResource($updated);
    }

    public function destroy(int $material): JsonResponse
    {
        $this->materialService->delete($material);

        return response()->json(['message' => 'Materi dihapus.']);
    }
}
