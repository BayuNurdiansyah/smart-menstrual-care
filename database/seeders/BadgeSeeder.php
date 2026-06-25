<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Stage;
use Illuminate\Database\Seeder;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        // Pemetaan badge ke tahap (berdasarkan slug stage).
        $map = [
            'know-your-body'        => ['slug' => 'kenali-tubuhku',          'name' => 'Kenali Tubuhku',          'icon' => 'fa-solid fa-medal'],
            'understand-care'       => ['slug' => 'ahli-kebersihan',         'name' => 'Ahli Kebersihan',         'icon' => 'fa-solid fa-medal'],
            'practice-smart-care'   => ['slug' => 'mandiri-menstruasi',      'name' => 'Mandiri Menstruasi',      'icon' => 'fa-solid fa-award'],
            'healthy-habit-builder' => ['slug' => 'healthy-habit-champion',  'name' => 'Healthy Habit Champion',  'icon' => 'fa-solid fa-trophy'],
        ];

        foreach ($map as $stageSlug => $badge) {
            $stage = Stage::where('slug', $stageSlug)->first();
            if ($stage === null) {
                continue;
            }

            Badge::updateOrCreate(
                ['slug' => $badge['slug']],
                [
                    'stage_id' => $stage->id,
                    'name'     => $badge['name'],
                    'icon'     => $badge['icon'], // PLACEHOLDER Font Awesome Free
                ]
            );
        }
    }
}
