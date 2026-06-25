<?php

namespace Database\Seeders;

use App\Enums\CycleStatus;
use App\Models\Cycle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class CycleSeeder extends Seeder
{
    public function run(): void
    {
        $murid = User::where('email', 'murid@smartmenstrual.test')->first();
        if ($murid === null) {
            return;
        }

        // 2 siklus historis yang sudah selesai (closed, manual).
        $cycles = [
            [
                'start_date'    => Carbon::now()->subDays(58)->toDateString(),
                'end_date'      => Carbon::now()->subDays(53)->toDateString(),
                'period_length' => 5,
                'cycle_length'  => 29, // jarak ke siklus berikutnya
            ],
            [
                'start_date'    => Carbon::now()->subDays(29)->toDateString(),
                'end_date'      => Carbon::now()->subDays(24)->toDateString(),
                'period_length' => 5,
                'cycle_length'  => null,
            ],
        ];

        foreach ($cycles as $cycle) {
            Cycle::updateOrCreate(
                ['user_id' => $murid->id, 'start_date' => $cycle['start_date']],
                [
                    'end_date'      => $cycle['end_date'],
                    'period_length' => $cycle['period_length'],
                    'cycle_length'  => $cycle['cycle_length'],
                    'status'        => CycleStatus::Closed->value,
                    'auto_closed'   => false,
                ]
            );
        }
    }
}
