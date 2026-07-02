<?php

namespace Database\Seeders;

use App\Enums\CycleStatus;
use App\Enums\UserRole;
use App\Models\AssessmentAttempt;
use App\Models\AssessmentQuestion;
use App\Models\Cycle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DemoStudentsSeeder extends Seeder
{
    public function run(): void
    {
        $questions = AssessmentQuestion::orderBy('order')->get();
        if ($questions->isEmpty()) {
            return; // butuh pertanyaan dari AssessmentSeeder
        }

        // 3 murid + target persen kemandirian per bulan (oldest -> newest).
        // Pola beda-beda, tapi nilai TERAKHIR selalu paling tinggi (akhir naik).
        $students = [
            ['name' => 'Putri Maharani', 'kelas' => '7A', 'email' => 'putri@smartmenstrual.test', 'targets' => [45, 58, 72, 90]], // naik stabil
            ['name' => 'Ayu Lestari',    'kelas' => '7B', 'email' => 'ayu@smartmenstrual.test',   'targets' => [72, 50, 62, 88]], // turun lalu naik
            ['name' => 'Dewi Anggraini', 'kelas' => '8A', 'email' => 'dewi@smartmenstrual.test',  'targets' => [60, 78, 48, 92]], // fluktuatif, akhir naik
        ];

        $maxPerDay = $questions->count() * 2; // 7 soal x 2 = 14
        $qIds = $questions->pluck('id')->all();

        foreach ($students as $s) {
            $user = User::updateOrCreate(
                ['email' => $s['email']],
                [
                    'name'              => $s['name'],
                    'password'          => null, // login nama + kelas
                    'role'              => UserRole::Murid->value,
                    'kelas'             => $s['kelas'],
                    'is_active'         => true,
                    'email_verified_at' => now(),
                ]
            );

            // Idempotent: lewati bila sudah punya data.
            if (AssessmentAttempt::where('user_id', $user->id)->exists()) {
                continue;
            }

            $count = count($s['targets']);
            foreach ($s['targets'] as $i => $target) {
                $monthsAgo = $count - $i; // 4,3,2,1 bulan lalu
                $start = Carbon::now()->subMonths($monthsAgo)->startOfMonth()->addDays(random_int(7, 12));
                $duration = random_int(5, 6);
                $end = $start->copy()->addDays($duration - 1);

                $cycle = Cycle::create([
                    'user_id'       => $user->id,
                    'start_date'    => $start->toDateString(),
                    'end_date'      => $end->toDateString(),
                    'period_length' => $duration,
                    'status'        => CycleStatus::Closed->value,
                    'auto_closed'   => false,
                ]);

                // Total target per hari + noise kecil (±1) agar rata-rata bulanan
                // tetap dekat target & urutan grafik terjaga (akhir naik).
                $targetTotal = (int) round($target / 100 * $maxPerDay);

                for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                    $dailyTotal = max(0, min($maxPerDay, $targetTotal + random_int(-1, 1)));

                    // Sebar total ke 7 soal sebagai skor 0-2.
                    $n = count($qIds);
                    $base = intdiv($dailyTotal, $n);
                    $rem = $dailyTotal % $n;
                    $scores = [];
                    foreach ($qIds as $qid) {
                        $scores[$qid] = $base;
                    }
                    $shuffled = $qIds;
                    shuffle($shuffled);
                    for ($k = 0; $k < $rem; $k++) {
                        $scores[$shuffled[$k]] = min(2, $base + 1);
                    }

                    $attempt = AssessmentAttempt::create([
                        'user_id'         => $user->id,
                        'cycle_id'        => $cycle->id,
                        'assessment_date' => $d->toDateString(),
                        'total_score'     => array_sum($scores),
                        'submitted_at'    => $d->copy()->setTime(19, 0),
                    ]);

                    $rows = [];
                    foreach ($scores as $qid => $sc) {
                        $rows[] = [
                            'attempt_id'  => $attempt->id,
                            'question_id' => $qid,
                            'score'       => $sc,
                            'created_at'  => now(),
                            'updated_at'  => now(),
                        ];
                    }
                    $attempt->answers()->insert($rows);
                }
            }
        }
    }
}
