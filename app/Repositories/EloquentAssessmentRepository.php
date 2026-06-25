<?php

namespace App\Repositories;

use App\Models\AssessmentAnswer;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\User;
use App\Repositories\Contracts\AssessmentRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class EloquentAssessmentRepository implements AssessmentRepositoryInterface
{
    public function activeQuestions(): Collection
    {
        return AssessmentQuestion::where('is_active', true)
            ->orderBy('order')
            ->get();
    }

    public function attemptForPeriod(int $userId, string $period): ?AssessmentAttempt
    {
        return AssessmentAttempt::where('user_id', $userId)
            ->where('period', $period)
            ->first();
    }

    public function createAttemptWithAnswers(array $attemptData, array $answers): AssessmentAttempt
    {
        return DB::transaction(function () use ($attemptData, $answers) {
            $totalScore = array_sum(array_column($answers, 'score'));

            $attempt = AssessmentAttempt::create(array_merge($attemptData, [
                'total_score'  => $totalScore,
                'submitted_at' => now(),
            ]));

            foreach ($answers as $answer) {
                AssessmentAnswer::create([
                    'attempt_id'  => $attempt->id,
                    'question_id' => $answer['question_id'],
                    'score'       => $answer['score'],
                ]);
            }

            return $attempt->load('answers.question');
        });
    }

    public function historyForUser(User $user): Collection
    {
        return AssessmentAttempt::where('user_id', $user->id)
            ->with(['answers.question'])
            ->orderBy('period')
            ->get()
            ->map(function (AssessmentAttempt $attempt) {
                // Format untuk Recharts: { period, total_score, ...per_category }
                $byCategory = $attempt->answers->groupBy('question.category')
                    ->map(fn ($group) => $group->avg('score'));

                return array_merge(
                    ['period' => $attempt->period, 'total_score' => $attempt->total_score],
                    $byCategory->toArray()
                );
            });
    }
}
