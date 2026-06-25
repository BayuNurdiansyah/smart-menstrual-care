<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Stage;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->content() as $slug => $materials) {
            $stage = Stage::where('slug', $slug)->first();
            if ($stage === null) {
                continue;
            }

            foreach ($materials as $i => $m) {
                $material = Material::updateOrCreate(
                    ['stage_id' => $stage->id, 'title' => $m['title']],
                    [
                        'text_content'     => $m['text'] ?? null,
                        'youtube_video_id' => $m['video'] ?? null, // mutator -> ID
                        'order'            => $i + 1,
                        'is_published'     => true,
                    ]
                );

                // Langkah-langkah (teks; ilustrasi di-upload admin lewat panel).
                $material->steps()->delete();
                foreach ($m['steps'] ?? [] as $si => $stepText) {
                    $material->steps()->create([
                        'order' => $si + 1,
                        'text'  => $stepText,
                    ]);
                }
            }
        }
    }

    /**
     * Isi materi tiap tahap (mengacu pada dokumen desain Word).
     * Topik yang langsung video: hanya 'title' + 'video' tanpa 'text'.
     */
    private function content(): array
    {
        return [
            // ── Tahap 1: Know Your Body ──────────────────────────────────────
            'know-your-body' => [
                [
                    'title' => 'Apa itu tahap ini?',
                    'text'  => "Pada tahap know your body (mengetahui tubuhmu), kamu akan belajar mengenal tubuhmu dan memahami perubahan yang terjadi saat memasuki masa pubertas. Kamu akan mengetahui apa itu menstruasi, mengapa menstruasi terjadi, dan perubahan apa saja yang mungkin kamu rasakan sebelum atau saat menstruasi.\n\nKamu juga akan belajar bahwa menstruasi adalah proses alami yang dialami oleh perempuan dan merupakan bagian dari pertumbuhan yang normal.",
                ],
                [
                    'title' => 'Hari Pertama Menstruasi',
                    // Langsung video (tanpa teks). Sumber: Channel YouTube Ester Jessica.
                    'video' => 'https://youtu.be/HfqK-ZDtZzQ',
                ],
                [
                    'title' => 'Tubuh Kita Bertumbuh dan Berubah',
                    'text'  => "Saat anak bertambah usia, tubuh akan tumbuh dan berubah. Perubahan ini disebut pubertas.\n\nPubertas adalah masa ketika tubuh mulai berkembang dari anak-anak menjadi remaja. Setiap orang mengalami pubertas pada waktu yang berbeda. Ada yang lebih cepat, ada yang lebih lambat. Semua itu normal.\n\nSemua perempuan memiliki rahim di dalam tubuhnya. Ketika perempuan mulai tumbuh menjadi remaja, tubuh akan mengalami berbagai perubahan. Salah satu perubahan tersebut adalah menstruasi atau haid.",
                ],
                [
                    'title' => 'Apa Itu Menstruasi?',
                    'text'  => "Menstruasi adalah keluarnya darah dari vagina selama beberapa hari setiap bulan.\n\nMenstruasi bukan penyakit dan bukan tanda tubuh rusak. Menstruasi adalah proses alami yang terjadi pada tubuh yang memiliki rahim.\n\nDarah menstruasi keluar karena bagian dalam rahim yang sebelumnya menebal tidak digunakan untuk kehamilan. Lapisan tersebut kemudian keluar bersama darah melalui vagina. Menstruasi biasanya terjadi setiap bulan.\n\nIngat: Menstruasi adalah hal yang normal dan dialami oleh banyak wanita di seluruh dunia.",
                ],
                [
                    'title' => 'Tanda-Tanda Pubertas',
                    'text'  => 'Saat pubertas, tubuh mengalami beberapa perubahan. Beberapa tanda pubertas adalah:',
                    'steps' => [
                        'Tinggi badan bertambah',
                        'Berat badan bertambah',
                        'Payudara mulai berkembang',
                        'Tumbuh rambut di ketiak',
                        'Tumbuh rambut di sekitar alat kelamin',
                        'Kulit lebih berminyak dan kadang muncul jerawat',
                        'Mulai mengalami menstruasi',
                        'Perasaan dan emosi kadang berubah lebih mudah',
                    ],
                ],
                [
                    'title' => 'Kapan Menstruasi Pertama Terjadi?',
                    'text'  => "Menstruasi pertama disebut menarke. Biasanya terjadi pada usia sekitar 9–16 tahun, tetapi setiap orang berbeda.\n\nJika menstruasi datang lebih cepat atau lebih lambat dari teman sebaya, itu belum tentu menjadi masalah.",
                ],
                [
                    'title' => 'Apa yang Dirasakan Tubuh Saat Menstruasi?',
                    'text'  => 'Setiap orang bisa merasakan hal yang berbeda. Hal yang sering dirasakan:',
                    'steps' => [
                        'Darah keluar dari vagina',
                        'Perut bagian bawah terasa nyeri atau kram',
                        'Tubuh terasa lebih lelah',
                        'Pinggang terasa pegal',
                        'Mudah sedih, kesal, atau sensitif',
                        'Nafsu makan bisa berubah',
                        'Ingin lebih banyak beristirahat',
                    ],
                ],
                [
                    'title' => 'Menjaga Kebersihan Saat Menstruasi',
                    'text'  => 'Hal yang harus dilakukan saat menstruasi untuk menjaga kebersihan:',
                    'steps' => [
                        'Gunakan pembalut yang bersih. Pilih pembalut yang masih bersih dan belum digunakan. Simpan pembalut di tempat yang kering agar tetap higienis.',
                        'Ganti pembalut secara teratur setiap 4–6 jam sekali, meskipun darah yang keluar sedikit. Jika darah sedang banyak, ganti lebih sering.',
                        'Cuci tangan sebelum dan sesudah mengganti pembalut menggunakan sabun dan air mengalir minimal 20 detik.',
                        'Bersihkan area kelamin dengan air bersih dari arah depan ke belakang agar kuman dari anus tidak berpindah.',
                        'Buang pembalut bekas dengan benar. Bungkus sebelum dibuang ke tempat sampah. Jangan membuang ke toilet karena dapat menyumbat saluran air.',
                    ],
                ],
                [
                    'title' => 'Menjaga Kesehatan Saat Menstruasi',
                    'text'  => 'Selain kebersihan, jaga juga kesehatan tubuh:',
                    'steps' => [
                        'Makan makanan bergizi: sayuran hijau, buah-buahan, sumber protein (telur, ikan, ayam, tempe, tahu), makanan pokok, serta susu jika cocok.',
                        'Minum air yang cukup sekitar 6–8 gelas (1.500–2.000 ml) per hari agar tubuh segar dan terhindar dari dehidrasi.',
                        'Istirahat yang cukup, tidur sekitar 8–10 jam setiap malam untuk memulihkan energi dan menjaga suasana hati.',
                    ],
                ],
                [
                    'title' => 'Kapan Harus Meminta Bantuan Orang Dewasa?',
                    'text'  => "Mintalah bantuan orang tua, guru, pendamping, atau tenaga kesehatan jika:\n- Bingung saat menstruasi pertama\n- Nyeri sangat kuat sampai sulit beraktivitas\n- Menstruasi membuat merasa tidak nyaman atau takut\n\nTidak perlu malu untuk bertanya. Namun, jangan sampai ketergantungan dengan orang dewasa ya — kamu dapat mandiri mengelola keadaanmu saat menstruasi. Hal ini hanya soal waktu dan kebiasaan.",
                ],
            ],

            // ── Tahap 2: Understand & Care ───────────────────────────────────
            'understand-care' => [
                [
                    'title' => 'Apa itu tahap ini?',
                    'text'  => 'Understand & Care (Pahami dan Rawat Diri) adalah tahap belajar tentang cara menjaga kebersihan dan kesehatan saat menstruasi. Pada tahap ini, kamu akan mengenal alat menstruasi, cara memakai pembalut, cara membuang pembalut bekas dengan benar, serta kebiasaan sehat yang membantu tubuh tetap bersih, nyaman, dan sehat selama menstruasi.',
                ],
                [
                    'title' => 'Alat dan Bahan Menstruasi',
                    'text'  => "Alat dan bahan yang dibutuhkan saat menstruasi:\n- Pembalut (bersayap dan tidak bersayap)\n- Celana dalam\n- Sabun (padat atau cair)\n- Tisu\n- Kantong plastik hitam",
                ],
                [
                    'title' => 'Ukuran Pembalut Berdasarkan Aliran Darah',
                    'text'  => "Light Flow (Aliran Ringan): ukuran sekitar 23 cm, cocok untuk sehari-hari atau akhir periode.\n\nMedium Flow (Aliran Sedang): ukuran 23–29 cm, ideal untuk hari dengan aliran sedang.\n\nHeavy Flow (Aliran Deras): ukuran 36 cm atau lebih, baik untuk hari-hari awal menstruasi.\n\nExtra Heavy Flow & Overnight (Sangat Deras/Malam): mulai 36 cm, 42 cm, atau lebih, untuk perlindungan maksimal saat tidur.",
                ],
                [
                    'title' => 'Cara Memasang Pembalut',
                    'text'  => "Pembalut Tanpa Sayap: bentuknya lurus tanpa lengan di samping. Cukup buka perekatnya, lalu tempelkan di bagian dalam celana dalam. Mengandalkan lem perekat. Cocok saat santai atau hari terakhir menstruasi.\n\nPembalut Bersayap: punya 'lengan' kecil di kanan-kiri yang dilipat ke bagian bawah celana dalam, menjaga pembalut tetap di tempatnya dan mencegah bocor ke samping. Cocok saat aktif atau hari-hari awal menstruasi.",
                ],
                [
                    'title' => 'Cara Membuang Pembalut',
                    'text'  => 'Langkah-langkah membersihkan dan membuang pembalut bekas:',
                    'steps' => [
                        'Persiapan dan melepas pembalut. Gunakan kamar mandi dengan keran air lancar. Lepas pembalut bekas perlahan dari celana dalam, hati-hati agar darah tidak menetes.',
                        'Membersihkan pembalut dengan air mengalir. Letakkan pembalut di atas WC atau dekat saluran air, bilas hingga darah luruh dan air menjadi jernih.',
                        'Memeras dan meniriskan. Peras perlahan untuk membuang sisa air, jangan terlalu keras. Tiriskan sebentar di tempat kering.',
                        'Membungkus pembalut. Gulung/lipat, masukkan ke plastik kresek hitam, lalu ikat rapat agar tidak ada aroma keluar.',
                        'Membuang ke tempat sampah. Buang ke tempat sampah (sebaiknya bertutup). Jangan membuang ke toilet.',
                        'Cuci tangan dengan sabun dan air mengalir hingga bersih untuk mencegah penyebaran kuman.',
                    ],
                ],
            ],

            // ── Tahap 3: Practice Smart Care & Be Independent ────────────────
            'practice-smart-care' => [
                [
                    'title' => 'Apa itu tahap ini?',
                    'text'  => 'Practice Smart Care & Be Independent (Latihan Merawat Diri dan Menjadi Mandiri) adalah tahap untuk mempraktikkan secara langsung keterampilan yang telah dipelajari. Kamu akan berlatih memakai pembalut dengan benar, menjaga kebersihan diri, serta membuat keputusan yang tepat untuk merawat tubuh secara mandiri.',
                ],
                [
                    'title' => 'Video Demonstrasi Pemakaian dan Membuang yang Benar',
                    // Langsung video. Sumber: Channel YouTube Nadiyya Syifa Utami.
                    'video' => 'https://youtu.be/QdXYRe3I9vI',
                ],
                [
                    'title' => 'Praktik Digital: Drag & Drop',
                    'text'  => 'Simulasi online: pasang pembalut ke posisi yang benar. Jika memasang dengan benar akan mendapat poin. Ada tombol Mulai dan Selesai untuk mencatat waktu yang dibutuhkan dalam memasangnya. Coba lewat mini game di bawah!',
                ],
            ],

            // ── Tahap 4: Healthy Habit Builder ───────────────────────────────
            'healthy-habit-builder' => [
                [
                    'title' => 'Apa itu tahap ini?',
                    'text'  => 'Healthy Habit Builder (Membangun Kebiasaan Sehat) adalah tahap untuk membiasakan diri menjaga kesehatan dan kebersihan saat menstruasi. Pada tahap ini, kamu dapat mencatat hari menstruasi pada Kalender Menstruasi, dan melihat perkembangan kemampuanmu merawat diri lewat Self-Assessment Kemandirian beserta grafik kemajuan. Akses keduanya melalui menu di bawah.',
                ],
            ],
        ];
    }
}
