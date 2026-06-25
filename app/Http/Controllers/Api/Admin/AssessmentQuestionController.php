<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\AssessmentRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssessmentQuestionController extends Controller
{
    public function __construct(
        private readonly AssessmentRepositoryInterface $repository,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => $this->repository->allQuestions()]);
    }

    public function store(Request $request): JsonResponse
    {
        $question = $this->repository->createQuestion($this->validateData($request));

        return response()->json(['data' => $question], 201);
    }

    public function update(Request $request, int $assessment_question): JsonResponse
    {
        $question = $this->repository->findQuestion($assessment_question);
        abort_if($question === null, 404, 'Pertanyaan tidak ditemukan.');

        $updated = $this->repository->updateQuestion($question, $this->validateData($request));

        return response()->json(['data' => $updated]);
    }

    public function destroy(int $assessment_question): JsonResponse
    {
        $question = $this->repository->findQuestion($assessment_question);
        abort_if($question === null, 404, 'Pertanyaan tidak ditemukan.');

        $this->repository->deleteQuestion($question);

        return response()->json(['message' => 'Pertanyaan dihapus.']);
    }

    private function validateData(Request $request): array
    {
        return $request->validate([
            'question_text' => ['required', 'string'],
            'category'      => ['nullable', 'string', 'max:100'],
            'order'         => ['nullable', 'integer', 'min:1'],
            'is_active'     => ['nullable', 'boolean'],
        ]);
    }
}
