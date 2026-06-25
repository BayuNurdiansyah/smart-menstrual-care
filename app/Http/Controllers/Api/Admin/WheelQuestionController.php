<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\WheelQuestionRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WheelQuestionController extends Controller
{
    public function __construct(
        private readonly WheelQuestionRepositoryInterface $repository,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->repository->all()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateData($request);
        $question = $this->repository->create($data);

        return response()->json(['data' => $question], 201);
    }

    public function update(Request $request, int $wheel_question): JsonResponse
    {
        $question = $this->repository->findById($wheel_question);
        abort_if($question === null, 404, 'Soal tidak ditemukan.');

        $updated = $this->repository->update($question, $this->validateData($request));

        return response()->json(['data' => $updated]);
    }

    public function destroy(int $wheel_question): JsonResponse
    {
        $question = $this->repository->findById($wheel_question);
        abort_if($question === null, 404, 'Soal tidak ditemukan.');

        $this->repository->delete($question);

        return response()->json(['message' => 'Soal dihapus.']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'stage_id'  => ['required', 'integer', 'exists:stages,id'],
            'question'  => ['required', 'string'],
            'option_a'  => ['required', 'string'],
            'option_b'  => ['required', 'string'],
            'option_c'  => ['required', 'string'],
            'answer'    => ['nullable', Rule::in(['a', 'b', 'c'])],
            'order'     => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);
    }
}
