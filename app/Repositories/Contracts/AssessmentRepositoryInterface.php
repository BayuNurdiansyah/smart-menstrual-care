<?php

namespace App\Repositories\Contracts;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\User;
use Illuminate\Support\Collection;

interface AssessmentRepositoryInterface
{
    /** 7 pertanyaan aktif, terurut. */
    public function activeQuestions(): Collection;

    // ── Kelola pertanyaan (admin) ───────────────────────────────────────────
    public function allQuestions(): Collection;

    public function findQuestion(int $id): ?AssessmentQuestion;

    public function createQuestion(array $data): AssessmentQuestion;

    public function updateQuestion(AssessmentQuestion $question, array $data): AssessmentQuestion;

    public function deleteQuestion(AssessmentQuestion $question): void;

    /** Attempt pada tanggal tertentu milik murid, jika ada. */
    public function attemptForDate(int $userId, string $date): ?AssessmentAttempt;

    /** Attempt + jawabannya pada tanggal tertentu milik murid, jika ada (untuk edit). */
    public function attemptWithAnswersForDate(int $userId, string $date): ?AssessmentAttempt;

    /** Daftar tanggal (Y-m-d) yang sudah diisi assessment untuk sebuah siklus. */
    public function assessedDatesForCycle(int $cycleId): array;

    /** Daftar SELURUH tanggal (Y-m-d) yang sudah diisi assessment murid (semua siklus). */
    public function allAssessedDatesForUser(int $userId): array;

    /** Buat attempt beserta jawaban-jawabannya dalam satu transaksi. */
    public function createAttemptWithAnswers(array $attemptData, array $answers): AssessmentAttempt;

    /** Perbarui attempt yang sudah ada beserta jawaban-jawabannya (ganti total). */
    public function updateAttemptWithAnswers(AssessmentAttempt $attempt, array $attemptData, array $answers): AssessmentAttempt;

    /** Hapus attempt beserta seluruh jawabannya. */
    public function deleteAttempt(AssessmentAttempt $attempt): void;

    /** Attempt pada tanggal tertentu milik siklus tertentu (untuk migrasi tanggal siklus). */
    public function attemptForDateInCycle(int $cycleId, string $date): ?AssessmentAttempt;

    /**
     * Hapus semua attempt (beserta jawabannya) milik siklus tertentu
     * yang assessment_date-nya STRICTLY antara $afterExclusive dan $beforeExclusive.
     */
    public function deleteAttemptsInRangeForCycle(int $cycleId, string $afterExclusive, string $beforeExclusive): void;

    /** Riwayat attempt murid untuk grafik tren (Recharts). */
    public function historyForUser(User $user): Collection;
}
