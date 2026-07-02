<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Urutan penting karena ada dependensi foreign key:
        // Stage -> (Badge, Game, Material) ; User -> (Cycle, Assessment attempts).
        $this->call([
            StageSeeder::class,       // 4 tahap (prasyarat badge/game/materi)
            UserSeeder::class,        // admin, murid, ortu + pivot murid-ortu
            BadgeSeeder::class,       // 4 badge terikat tahap
            GameSeeder::class,        // Memory Card & Drag & Drop
            WheelQuestionSeeder::class, // 15 soal Roda Keberuntungan (KYB)
            MaterialSeeder::class,    // materi tahap 1-4 (teks + URL YouTube)
            CycleSeeder::class,       // riwayat siklus dummy (sebelum assessment harian)
            AssessmentSeeder::class,  // 7 pertanyaan + assessment HARIAN per siklus
            DemoStudentsSeeder::class, // 3 murid contoh dgn grafik kemandirian berbeda
        ]);
    }
}
