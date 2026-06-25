<?php

namespace Database\Seeders;

use App\Models\Stage;
use Illuminate\Database\Seeder;

class StageSeeder extends Seeder
{
    public function run(): void
    {
        // 4 tahap pembelajaran. Icon = placeholder class Font Awesome Free.
        $stages = [
            [
                'slug'        => 'know-your-body',
                'title'       => 'Know Your Body',
                'description' => 'Mengenali tubuh dan tanda-tanda menstruasi.',
                'order'       => 1,
                'icon'        => 'fa-solid fa-person', // PLACEHOLDER Font Awesome
            ],
            [
                'slug'        => 'understand-care',
                'title'       => 'Understand & Care',
                'description' => 'Memahami siklus dan menjaga kebersihan diri.',
                'order'       => 2,
                'icon'        => 'fa-solid fa-hand-holding-heart', // PLACEHOLDER
            ],
            [
                'slug'        => 'practice-smart-care',
                'title'       => 'Practice Smart Care & Be Independent',
                'description' => 'Melatih perawatan diri secara mandiri.',
                'order'       => 3,
                'icon'        => 'fa-solid fa-hands-bubbles', // PLACEHOLDER
            ],
            [
                'slug'        => 'healthy-habit-builder',
                'title'       => 'Healthy Habit Builder',
                'description' => 'Membangun kebiasaan sehat berkelanjutan.',
                'order'       => 4,
                'icon'        => 'fa-solid fa-heart-circle-check', // PLACEHOLDER
            ],
        ];

        foreach ($stages as $stage) {
            Stage::updateOrCreate(['slug' => $stage['slug']], $stage);
        }
    }
}
