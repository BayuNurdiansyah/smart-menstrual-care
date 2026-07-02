import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { getStageMaterials } from '../../api/material';
import { stageById } from '../../utils/stages';
import SpinWheel from '../games/SpinWheel';
import MemoryCard from '../games/MemoryCard';
import SpeakButton from '../../components/SpeakButton';
import FinishLearningButton from '../../components/FinishLearningButton';

// Susun seluruh teks materi untuk dibacakan (text-to-speech).
function buildSpeech(material) {
    const parts = [material.title, material.text_content];
    (material.steps ?? []).forEach((s) => parts.push(`Langkah ${s.order}. ${s.text}`));
    (material.images ?? []).forEach((img) => img.caption && parts.push(img.caption));
    return parts.filter(Boolean).join('. ');
}

// Pemetaan tahap -> komponen mini game (sesuai Word).
//  1 Know Your Body            -> Roda Keberuntungan
//  2 Understand & Care         -> Memory Card
//  3 Practice Smart Care       -> tidak ada game
//  4 Healthy Habit Builder     -> tidak ada game (Kalender + Assessment)
const STAGE_HAS_GAME = [1, 2];

function StageGame({ stageId }) {
    const id = Number(stageId);
    if (id === 1) return <SpinWheel stageId={id} />;
    if (id === 2) return <MemoryCard stageId={id} />;
    return null;
}

export default function ModulStage() {
    const { stageId } = useParams();
    const navigate = useNavigate();
    const stage = stageById(stageId);

    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openIds, setOpenIds] = useState(() => new Set()); // topik yang terbuka

    const toggle = (id) => {
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError('');

        getStageMaterials(stageId)
            .then((res) => {
                if (active) setMaterials(res.data.data ?? []);
            })
            .catch((err) => {
                if (active) setError(err.response?.data?.message ?? 'Gagal memuat materi.');
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [stageId]);

    return (
        <MobileLayout title={stage?.title ?? 'Materi'} subtitle="Modul Pembelajaran">
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => navigate('/murid')}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    {/* PLACEHOLDER: <i className="fa-solid fa-arrow-left" /> */}
                    &lsaquo; Kembali
                </button>

                {loading && <p className="text-gray-500">Memuat materi...</p>}

                {error && (
                    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && materials.length === 0 && (
                    <p className="text-gray-500">Belum ada materi untuk tahap ini.</p>
                )}

                {/* Daftar topik: awalnya judul saja, klik untuk buka detail */}
                <div className="space-y-3">
                    {materials.map((material) => {
                        const open = openIds.has(material.id);
                        return (
                            <article
                                key={material.id}
                                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                            >
                                {/* Header judul (highlight) */}
                                <button
                                    type="button"
                                    onClick={() => toggle(material.id)}
                                    aria-expanded={open}
                                    className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition ${
                                        open ? 'bg-primary text-white' : 'bg-primary-50 text-primary-800 hover:bg-primary-100'
                                    }`}
                                >
                                    <span className="font-bold">{material.title}</span>
                                    {/* PLACEHOLDER: <i className="fa-solid fa-chevron-down" /> */}
                                    <i
                                        className={`fa-solid fa-chevron-down shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </button>

                                {/* Detail isi (muncul saat dibuka) */}
                                {open && (
                                    <div className="px-5 py-4">
                                        {/* Narasi suara asli diunggah admin lewat panel; jatuh ke TTS jika belum ada. */}
                                        <div className="mb-3">
                                            <SpeakButton text={buildSpeech(material)} audioSrc={material.audio_url} />
                                        </div>

                                        {material.text_content && (
                                            <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-700">
                                                {material.text_content}
                                            </p>
                                        )}

                                        {material.youtube_embed_url && (
                                            <div className="aspect-video overflow-hidden rounded-lg">
                                                <iframe
                                                    src={material.youtube_embed_url}
                                                    title={material.title}
                                                    className="h-full w-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}

                                        {material.steps?.length > 0 && (
                                            <ol className="mt-4 space-y-3">
                                                {material.steps.map((step) => (
                                                    <li key={step.id} className="flex gap-3">
                                                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                                                            {step.order}
                                                        </span>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{step.text}</p>
                                                            {step.image_url && (
                                                                <img src={step.image_url} alt="" className="mt-2 w-full rounded-lg object-cover" />
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}

                                        {material.images?.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {material.images.map((img) => (
                                                    <figure key={img.id}>
                                                        <img src={img.image_url} alt={img.caption ?? ''} className="w-full rounded-lg object-cover" />
                                                        {img.caption && <figcaption className="mt-1 text-center text-xs text-gray-500">{img.caption}</figcaption>}
                                                    </figure>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>

                {/* Tahap 4 (Healthy Habit Builder): satu menu Kalender (berisi tracker + grafik) */}
                {!loading && !error && Number(stageId) === 4 && (
                    <section>
                        <h2 className="mb-3 text-base font-bold text-gray-800">Fitur Tahap Ini</h2>
                        <button
                            type="button"
                            onClick={() => navigate('/murid/tracker')}
                            className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-400 via-primary to-primary-600 p-5 text-left text-white shadow-lg transition hover:brightness-105"
                        >
                            <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-4 -top-4 w-20 opacity-30" />
                            <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="pointer-events-none absolute right-6 bottom-3 w-6 opacity-70" />
                            <div className="relative flex items-center gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25">
                                    {/* PLACEHOLDER: <i className="fa-solid fa-calendar-heart" /> */}
                                    <i className="fa-solid fa-calendar-days text-2xl" aria-hidden="true" />
                                </span>
                                <div className="flex-1">
                                    <span className="block text-lg font-bold">Kalender & Kemandirian</span>
                                    <span className="block text-sm text-white/90">Catat menstruasi, isi assessment harian, lihat grafik kemandirian.</span>
                                </div>
                                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                            </div>
                        </button>
                    </section>
                )}

                {/* Tahap 3: tanpa game -> tombol tandai selesai untuk badge */}
                {!loading && !error && Number(stageId) === 3 && (
                    <section>
                        <h2 className="mb-3 text-base font-bold text-gray-800">Selesaikan Tahap</h2>
                        <FinishLearningButton stageId={3} />
                    </section>
                )}

                {/* Mini Game hanya untuk tahap yang memilikinya (1 & 2) */}
                {!loading && !error && STAGE_HAS_GAME.includes(Number(stageId)) && (
                    <section>
                        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800">
                            {/* PLACEHOLDER: <i className="fa-solid fa-gamepad" /> */}
                            Mini Game
                        </h2>
                        <StageGame stageId={stageId} />
                    </section>
                )}
            </div>
        </MobileLayout>
    );
}
