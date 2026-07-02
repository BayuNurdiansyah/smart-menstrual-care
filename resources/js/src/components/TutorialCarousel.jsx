import React, { useState } from 'react';

/**
 * Slide tutorial garis besar untuk pengguna baru. Gambar diambil dari
 * public/img/tutorial/*.jpg — belum tersedia sampai admin mengunggahnya;
 * selama itu tampil placeholder ikon (lihat `broken` di bawah).
 */
const SLIDES = [
    {
        image: '/img/tutorial/1-kalender.jpg',
        title: 'Tandai Hari Pertama Menstruasi',
        caption: 'Buka menu Kalender, lalu ketuk tanggal hari ini untuk menandai mulai menstruasi.',
    },
    {
        image: '/img/tutorial/2-assessment.jpg',
        title: 'Isi Assessment Harian',
        caption: 'Setiap hari menstruasi, jawab beberapa pertanyaan singkat tentang cara kamu merawat diri hari itu.',
    },
    {
        image: '/img/tutorial/3-modul.jpg',
        title: 'Belajar & Kumpulkan Badge',
        caption: 'Pelajari materi tahap demi tahap, lalu kumpulkan badge setiap kali satu tahap selesai.',
    },
    {
        image: '/img/tutorial/4-grafik.jpg',
        title: 'Pantau Grafik Kemandirian',
        caption: 'Lihat perkembangan kemandirianmu merawat diri dari waktu ke waktu lewat grafik.',
    },
];

export default function TutorialCarousel() {
    const [index, setIndex] = useState(0);
    const [broken, setBroken] = useState(() => new Set());
    const slide = SLIDES[index];

    const prev = () => setIndex((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === SLIDES.length - 1 ? 0 : i + 1));

    return (
        <section className="mt-8 rounded-2xl bg-gray-50 p-4">
            <h2 className="mb-3 text-center text-sm font-bold text-gray-800">Cara Menggunakan Aplikasi</h2>

            <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center bg-primary-50">
                    {broken.has(slide.image) ? (
                        <div className="flex flex-col items-center justify-center text-primary-300">
                            <i className="fa-solid fa-image text-3xl" aria-hidden="true" />
                            <span className="mt-1 text-[10px]">Screenshot segera ditambahkan</span>
                        </div>
                    ) : (
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className="h-full w-full object-cover"
                            onError={() => setBroken((b) => new Set(b).add(slide.image))}
                        />
                    )}
                </div>
                <div className="p-4 text-center">
                    <p className="text-sm font-semibold text-gray-800">{slide.title}</p>
                    <p className="mt-1 text-xs text-gray-600">{slide.caption}</p>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={prev} aria-label="Sebelumnya" className="rounded-lg px-3 py-1 text-primary hover:bg-primary-100">
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
                <div className="flex gap-1.5">
                    {SLIDES.map((s, i) => (
                        <button
                            key={s.image}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`h-2 w-2 rounded-full transition ${i === index ? 'bg-primary' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
                <button type="button" onClick={next} aria-label="Berikutnya" className="rounded-lg px-3 py-1 text-primary hover:bg-primary-100">
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
            </div>
        </section>
    );
}
