<?php

namespace App\Repositories\Eloquent;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\User;
use App\Repositories\Contracts\AssessmentRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AssessmentRepository implements AssessmentRepositoryInterface
{
    public function activeQuestions(): Collection
    {
        return AssessmentQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function allQuestions(): Collection
    {
        return AssessmentQuestion::orderBy('order')->get();
    }

    public function findQuestion(int $id): ?AssessmentQuestion
    {
        return AssessmentQuestion::find($id);
    }

    public function createQuestion(array $data): AssessmentQuestion
    {
        return AssessmentQuestion::create($data);
    }

    public function updateQuestion(AssessmentQuestion $question, array $data): AssessmentQuestion
    {
        $question->fill($data)->save();

        return $question->refresh();
    }

    public function deleteQuestion(AssessmentQuestion $question): void
    {
        $question->delete();
    }

    public function attemptForDate(int $userId, string $date): ?AssessmentAttempt
    {
        // Didukung unique index (user_id, assessment_date).
        return AssessmentAttempt::where('user_id', $userId)
            ->whereDate('assessment_date', $date)
            ->first();
    }

    public function attemptWithAnswersForDate(int $userId, string $date): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('user_id', $userId)
            ->whereDate('assessment_date', $date)
            ->with(['answers', 'cycle'])
            ->first();
    }

    public function assessedDatesForCycle(int $cycleId): array
    {
        // get() agar cast 'date' aktif (pluck builder mengembalikan nilai mentah).
        return AssessmentAttempt::where('cycle_id', $cycleId)
            ->orderBy('assessment_date')
            ->get()
            ->map(fn (AssessmentAttempt $a) => $a->assessment_date->toDateString())
            ->all();
    }

    public function allAssessedDatesForUser(int $userId): array
    {
        return AssessmentAttempt::where('user_id', $userId)
            ->orderBy('assessment_date')
            ->get()
            ->map(fn (AssessmentAttempt $a) => $a->assessment_date->toDateString())
            ->all();
    }

    public function createAttemptWithAnswers(array $attemptData, array $answers): AssessmentAttempt
    {
        // Satu transaksi: attempt + seluruh jawaban (bulk insert) konsisten.
        return DB::transaction(function () use ($attemptData, $answers) {
            $attempt = AssessmentAttempt::create($attemptData);

            $now = now();
            $rows = array_map(fn (array $a) => [
                'attempt_id'  => $attempt->id,
                'question_id' => $a['question_id'],
                'score'       => $a['score'],
                'created_at'  => $now,
                'updated_at'  => $now,
            ], $answers);

            // Bulk insert -> satu query, lebih efisien daripada save per baris.
            $attempt->answers()->insert($rows);

            return $attempt->load('answers');
        });
    }

    public function updateAttemptWithAnswers(AssessmentAttempt $attempt, array $attemptData, array $answers): AssessmentAttempt
    {
        // Koreksi isian yang sudah ada (mis. salah klik): ganti total jawaban.
        return DB::transaction(function () use ($attempt, $attemptData, $answers) {
            $attempt->fill($attemptData)->save();
            $attempt->answers()->delete();

            $now = now();
            $rows = array_map(fn (array $a) => [
                'attempt_id'  => $attempt->id,
                'question_id' => $a['question_id'],
                'score'       => $a['score'],
                'created_at'  => $now,
                'updated_at'  => $now,
            ], $answers);
            $attempt->answers()->insert($rows);

            return $attempt->load('answers');
        });
    }

    public function historyForUser(User $user): Collection
    {
        // Eager load jawaban + pertanyaan untuk grafik per-kategori (hindari N+1).
        return $user->assessmentAttempts()
            ->with(['answers.question'])
            ->orderBy('assessment_date')
            ->get();
    }
}
