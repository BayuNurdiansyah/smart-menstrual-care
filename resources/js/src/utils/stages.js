// 4 tahap pembelajaran (id selaras dengan StageSeeder, urut 1-4).
// Icon = placeholder class Font Awesome Free.
export const STAGES = [
    { id: 1, slug: 'know-your-body', title: 'Know Your Body', icon: 'fa-solid fa-person' },
    { id: 2, slug: 'understand-care', title: 'Understand & Care', icon: 'fa-solid fa-hand-holding-heart' },
    { id: 3, slug: 'practice-smart-care', title: 'Practice Smart Care & Be Independent', icon: 'fa-solid fa-hands-bubbles' },
    { id: 4, slug: 'healthy-habit-builder', title: 'Healthy Habit Builder', icon: 'fa-solid fa-heart-circle-check' },
];

export function stageById(id) {
    return STAGES.find((s) => String(s.id) === String(id)) ?? null;
}
