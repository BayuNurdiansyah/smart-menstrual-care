<?php

namespace Database\Seeders;

use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class AssessmentSeeder extends Seeder
{
    public function run(): void
    {
        // 1) 7 pertanyaan kemandirian perawatan diri (skala jawaban 0-2).
        $questions = [
            ['order' => 1, 'category' => 'Penggunaan', 'question_text' => 'Memasang pembalut'],
            ['order' => 2, 'category' => 'Penggunaan', 'question_text' => 'Mengganti pembalut'],
            ['order' => 3, 'category' => 'Kebersihan', 'question_text' => 'Membersihkan area intim'],
            ['order' => 4, 'category' => 'Kebersihan', 'question_text' => 'Mencuci tangan'],
            ['order' => 5, 'category' => 'Kebersihan', 'question_text' => 'Membuang pembalut'],
            ['order' => 6, 'category' => 'Kemandirian', 'question_text' => 'Menyiapkan perlengkapan'],
            ['order' => 7, 'category' => 'Kemandirian', 'question_text' => 'Mengingat jadwal'],
        ];

        foreach ($questions as $q) {
            AssessmentQuestion::updateOrCreate(
                ['order' => $q['order']],
                [
                    'question_text' => $q['question_text'],
                    'category'      => $q['category'],
                    'is_active'     => true,
                ]
            );
        }

        // 2) Assessment HARIAN dummy: untuk tiap siklus murid yang sudah selesai,
        //    isi assessment tiap harinya (skor membaik dari hari ke hari).
        $murid = User::where('email', 'murid@smartmenstrual.test')->first();
        if ($murid === null) {
            return;
        }

        $activeQuestions = AssessmentQuestion::orderBy('order')->get();
        $cycles = $murid->cycles()->whereNotNull('end_date')->get();

        foreach ($cycles as $cycle) {
            $start = $cycle->start_date->copy();
            $end = $cycle->end_date->copy();
            $dayIndex = 0;

            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $dateStr = $d->toDateString();

                // Idempotent: lewati bila tanggal itu sudah ada.
                if (AssessmentAttempt::where('user_id', $murid->id)->whereDate('assessment_date', $dateStr)->exists()) {
                    $dayIndex++;
                    continue;
                }

                // Skor naik perlahan: hari awal banyak "dengan bantuan", makin mandiri.
                $base = min(2, intdiv($dayIndex, 2)); // 0,0,1,1,2,2,...
                $scores = [];
                foreach ($activeQuestions as $i => $q) {
                    $scores[$q->id] = max(0, min(2, $base + (($i + $dayIndex) % 2)));
                }

                $attempt = AssessmentAttempt::create([
                    'user_id'         => $murid->id,
                    'cycle_id'        => $cycle->id,
                    'assessment_date' => $dateStr,
                    'total_score'     => array_sum($scores),
                    'submitted_at'    => $d->copy()->setTime(19, 0),
                ]);

                $rows = [];
                foreach ($scores as $questionId => $score) {
                    $rows[] = [
                        'attempt_id'  => $attempt->id,
                        'question_id' => $questionId,
                        'score'       => $score,
                        'created_at'  => now(),
                        'updated_at'  => now(),
                    ];
                }
                $attempt->answers()->insert($rows);

                $dayIndex++;
            }
        }
    }
}
