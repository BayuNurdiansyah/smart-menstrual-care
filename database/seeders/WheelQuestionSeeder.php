<?php

namespace Database\Seeders;

use App\Models\Stage;
use App\Models\WheelQuestion;
use Illuminate\Database\Seeder;

class WheelQuestionSeeder extends Seeder
{
    public function run(): void
    {
        $stage = Stage::where('slug', 'know-your-body')->first();
        if ($stage === null) {
            return;
        }

        // 15 soal Roda Keberuntungan (sumber: dokumen desain Word).
        $questions = [
            ['Berapa jam sekali pembalut perlu diganti?', 'Setiap 1 hari sekali', 'Setiap 4–6 jam sekali', 'Setiap 2 hari sekali', 'b'],
            ['Apa yang harus dilakukan setelah mengganti pembalut?', 'Cuci tangan dengan sabun', 'Langsung bermain', 'Tidur', 'a'],
            ['Makanan mana yang baik dimakan saat menstruasi?', 'Bayam', 'Permen', 'Keripik', 'a'],
            ['Apakah menstruasi itu normal?', 'Ya, normal', 'Tidak normal', 'Penyakit', 'a'],
            ['Ke mana pembalut bekas harus dibuang?', 'Toilet', 'Sungai', 'Tempat sampah', 'c'],
            ['Apa yang digunakan untuk menyerap darah menstruasi?', 'Pembalut', 'Buku', 'Handuk', 'a'],
            ['Saat menstruasi kita perlu minum air putih sebanyak ...', '1 gelas sehari', '6–8 gelas sehari', 'Tidak perlu minum', 'b'],
            ['Saat menstruasi kita dianjurkan tidur sekitar ...', '2 jam', '4 jam', '8–10 jam', 'c'],
            ['Jika pembalut sudah penuh, apa yang harus dilakukan?', 'Tetap dipakai', 'Diganti dengan pembalut baru', 'Disimpan', 'b'],
            ['Apa yang perlu dilakukan sebelum mengganti pembalut?', 'Cuci tangan', 'Makan permen', 'Menonton televisi', 'a'],
            ['Saat menstruasi kita boleh ...', 'Tetap belajar dan beraktivitas', 'Tidak boleh keluar kamar', 'Tidak boleh sekolah', 'a'],
            ['Bagaimana cara membersihkan area kelamin?', 'Dengan air bersih', 'Dengan cat', 'Dengan pasir', 'a'],
            ['Menstruasi terjadi pada ...', 'Semua perempuan yang sudah memasuki pubertas', 'Semua bayi', 'Semua laki-laki', 'a'],
            ['Jika merasa bingung saat menstruasi, siapa yang dapat membantu?', 'Orang tua, guru, atau pendamping', 'Tidak perlu bertanya', 'Teman yang tidak tahu', 'a'],
            ['Mengapa pembalut harus diganti secara teratur?', 'Agar tetap bersih dan nyaman', 'Agar cepat rusak', 'Tidak ada alasan', 'a'],
        ];

        foreach ($questions as $i => $q) {
            WheelQuestion::updateOrCreate(
                ['stage_id' => $stage->id, 'order' => $i + 1],
                [
                    'question'  => $q[0],
                    'option_a'  => $q[1],
                    'option_b'  => $q[2],
                    'option_c'  => $q[3],
                    'answer'    => $q[4],
                    'is_active' => true,
                ]
            );
        }
    }
}
