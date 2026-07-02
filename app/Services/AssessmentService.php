<?php

namespace App\Services;

use App\Enums\AssessmentOption;
use App\Exceptions\AssessmentException;
use App\Models\AssessmentAttempt;
use App\Repositories\Contracts\AssessmentRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Carbon;

class AssessmentService
{
    /** Mulai hari ke berapa pilihan "menstruasi selesai" ditawarkan. */
    private const FINISH_PROMPT_DAY = 6;

    /** Batas maksimal hari menstruasi (selaras CycleService). */
    private const MAX_DAYS = 10;

    public function __construct(
        private readonly AssessmentRepositoryInterface $assessmentRepository,
        private readonly UserRepositoryInterface $userRepository,
        private readonly CycleService $cycleService,
    ) {
    }

    /**
     * Daftar pertanyaan aktif untuk ditampilkan di form (dengan ID-nya).
     *
     * @return array<int,array<string,mixed>>
     */
    public function getActiveQuestions(): array
    {
        return $this->assessmentRepository->activeQuestions()
            ->map(fn ($q) => [
                'id'            => $q->id,
                'order'         => $q->order,
                'question_text' => $q->question_text,
                'category'      => $q->category,
            ])
            ->all();
    }

    /**
     * Status assessment harian untuk siklus yang sedang berjalan:
     * tanggal mana yang sudah/belum diisi, dan kapan pilihan "selesai" muncul.
     *
     * @return array<string,mixed>
     */
    public function getDailyStatus(int $userId): array
    {
        $cycle = $this->cycleService->getCurrentCycle($userId);

        if ($cycle === null || $cycle->status !== 'ongoing') {
            return ['active' => false];
        }

        $start = $cycle->start_date->copy()->startOfDay();
        $today = Carbon::today();
        $assessed = $this->assessmentRepository->assessedDatesForCycle($cycle->id);

        // Hari menstruasi sejauh ini (start s/d hari ini), tandai sudah/belum.
        $pending = [];
        for ($d = $start->copy(); $d->lte($today); $d->addDay()) {
            $ds = $d->toDateString();
            if (! in_array($ds, $assessed, true)) {
                $pending[] = ['date' => $ds, 'day' => $start->diffInDays($d) + 1];
            }
        }

        return [
            'active'          => true,
            'cycle'           => ['id' => $cycle->id, 'start_date' => $start->toDateString()],
            'today'           => $today->toDateString(),
            'assessed_dates'  => $assessed,
            'pending_dates'   => $pending,
            'finish_from_day' => self::FINISH_PROMPT_DAY,
            'max_days'        => self::MAX_DAYS,
        ];
    }

    /**
     * Simpan assessment HARIAN untuk satu tanggal menstruasi. Jika tanggal ini
     * sudah pernah diisi sebelumnya, jawabannya DIPERBARUI (antisipasi salah
     * klik) alih-alih ditolak. Bila $finished true, siklus ditutup pada
     * tanggal tersebut.
     *
     * @param  array<int,int>  $answers  Pemetaan [question_id => score]
     * @return array<string,mixed>
     */
    public function submitDailyAssessment(int $userId, string $date, array $answers, bool $finished = false): array
    {
        $this->validateAnswers($answers);

        $cycle = $this->cycleService->getCurrentCycle($userId);
        if ($cycle === null || $cycle->status !== 'ongoing') {
            throw AssessmentException::noActiveCycle();
        }

        // Tanggal harus dalam rentang siklus berjalan (start s/d hari ini).
        $start = $cycle->start_date->copy()->startOfDay();
        $target = Carbon::parse($date)->startOfDay();
        if ($target->lt($start) || $target->gt(Carbon::today())) {
            throw AssessmentException::invalidDate();
        }

        $rows = [];
        foreach ($answers as $questionId => $score) {
            $rows[] = ['question_id' => $questionId, 'score' => $score];
        }

        $attemptData = [
            'user_id'         => $userId,
            'cycle_id'        => $cycle->id,
            'assessment_date' => $target->toDateString(),
            'total_score'     => array_sum($answers),
            'submitted_at'    => Carbon::now(),
        ];

        $existing = $this->assessmentRepository->attemptForDate($userId, $target->toDateString());
        $attempt = $existing !== null
            ? $this->assessmentRepository->updateAttemptWithAnswers($existing, $attemptData, $rows)
            : $this->assessmentRepository->createAttemptWithAnswers($attemptData, $rows);

        // Pilihan "selesai" -> tutup siklus pada tanggal ini.
        $closed = false;
        if ($finished) {
            $this->cycleService->finishCycle($userId, $target->toDateString());
            $closed = true;
        }

        return [
            'id'          => $attempt->id,
            'date'        => $target->toDateString(),
            'total_score' => $attempt->total_score,
            'cycle_closed' => $closed,
        ];
    }

    /**
     * Jawaban yang sudah tersimpan pada tanggal tertentu (untuk prefill form
     * saat murid membuka kembali tanggal yang sudah diisi untuk dikoreksi).
     *
     * @return array<string,mixed>
     */
    public function getAnswersForDate(int $userId, string $date): array
    {
        $target = Carbon::parse($date)->startOfDay();
        $attempt = $this->assessmentRepository->attemptWithAnswersForDate($userId, $target->toDateString());

        $answers = [];
        foreach ($attempt?->answers ?? [] as $answer) {
            $answers[$answer->question_id] = $answer->score;
        }

        return ['date' => $target->toDateString(), 'answers' => $answers];
    }

    /**
     * Seluruh tanggal (Y-m-d) yang sudah diisi assessment oleh murid, lintas
     * siklus (dipakai kalender untuk menandai hari yang benar-benar terisi).
     */
    public function getAssessedDates(int $userId): array
    {
        return $this->assessmentRepository->allAssessedDatesForUser($userId);
    }

    /** Validasi: semua pertanyaan aktif terjawab & skor dalam rentang (0-2). */
    private function validateAnswers(array $answers): void
    {
        $validIds = $this->assessmentRepository->activeQuestions()->pluck('id')->all();
        $allowed  = AssessmentOption::values();

        if (count($answers) !== count($validIds)) {
            throw AssessmentException::invalidAnswers();
        }
        foreach ($validIds as $id) {
            if (! array_key_exists($id, $answers) || ! in_array($answers[$id], $allowed, true)) {
                throw AssessmentException::invalidAnswers();
            }
        }
    }

    /**
     * Transformasi riwayat assessment menjadi struktur siap-Recharts.
     *
     * Bentuk keluaran:
     *  - trend:      [{ period, total, average }]      -> LineChart kemandirian
     *  - categories: [{ category, score }]             -> Bar/Radar (attempt terbaru)
     *  - meta:       { questionCount, maxPerQuestion }
     *
     * @return array<string,mixed>
     */
    public function getFormattedChartData(int $userId): array
    {
        $user = $this->userRepository->findById($userId);

        if ($user === null) {
            return $this->emptyChart();
        }

        $history = $this->assessmentRepository->historyForUser($user);

        if ($history->isEmpty()) {
            return $this->emptyChart();
        }

        // Input tetap HARIAN; grafik diagregasi PER BULAN dalam persen.
        // Persen bulan = rata-rata dari (skor harian / skor maksimal harian * 100).
        $byMonth = $history->groupBy(fn (AssessmentAttempt $a) => optional($a->assessment_date)->format('Y-m'));

        $trend = [];
        foreach ($byMonth as $ym => $attempts) {
            if (! $ym) {
                continue;
            }
            $percents = $attempts->map(function (AssessmentAttempt $a) {
                $maxPerDay = max(1, $a->answers->count() * AssessmentOption::max());

                return $a->total_score / $maxPerDay * 100;
            });

            $trend[$ym] = [
                'ym'      => $ym,
                'period'  => $this->monthLabel($ym),
                'percent' => (int) round($percents->avg()),
                'days'    => $attempts->count(),
            ];
        }

        ksort($trend); // urut kronologis
        $trend = array_values($trend);

        return [
            'trend'          => $trend,
            'interpretation' => $this->buildInterpretation($trend),
            'meta'           => ['maxPerQuestion' => AssessmentOption::max()],
        ];
    }

    /** Interpretasi otomatis: bandingkan bulan lalu vs bulan ini. */
    private function buildInterpretation(array $trend): ?array
    {
        $n = count($trend);
        if ($n === 0) {
            return null;
        }

        if ($n === 1) {
            $to = $trend[0]['percent'];

            return ['from' => null, 'to' => $to, 'direction' => 'stabil', 'text' => "Kemandirian bulan ini: {$to}%."];
        }

        $from = $trend[$n - 2]['percent'];
        $to = $trend[$n - 1]['percent'];
        $direction = $to > $from ? 'meningkat' : ($to < $from ? 'menurun' : 'stabil');

        return [
            'from'      => $from,
            'to'        => $to,
            'direction' => $direction,
            'text'      => "Kemandirian {$direction} dari {$from}% menjadi {$to}%.",
        ];
    }

    /** Label bulan singkat Bahasa Indonesia, mis. "Jun 2026". */
    private function monthLabel(string $ym): string
    {
        $names = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        [$y, $m] = array_map('intval', explode('-', $ym));

        return ($names[$m] ?? $m) . ' ' . $y;
    }

    /** @return array<string,mixed> */
    private function emptyChart(): array
    {
        return [
            'trend'          => [],
            'interpretation' => null,
            'meta'           => ['maxPerQuestion' => AssessmentOption::max()],
        ];
    }
}
