import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getWheelQuestions } from '../../api/game';
import useStageComplete from '../../hooks/useStageComplete';
import BadgeModal from '../../components/BadgeModal';
import SpeakButton from '../../components/SpeakButton';

const OPTS = ['a', 'b', 'c'];

export default function SpinWheel({ stageId }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [selected, setSelected] = useState(null);
    const [chosen, setChosen] = useState(null);
    const spinTimer = useRef(null);

    const { complete, badge, clearBadge } = useStageComplete(stageId);

    useEffect(() => {
        getWheelQuestions(stageId)
            .then((res) => setQuestions(res.data.data ?? []))
            .catch(() => setQuestions([]))
            .finally(() => setLoading(false));
        return () => clearTimeout(spinTimer.current);
    }, [stageId]);

    const wheelBg = useMemo(() => {
        const n = Math.max(questions.length, 6);
        const slice = 360 / n;
        const stops = [];
        for (let i = 0; i < n; i += 1) {
            const color = i % 2 === 0 ? '#f9a8cc' : '#e879a0';
            stops.push(`${color} ${i * slice}deg ${(i + 1) * slice}deg`);
        }
        return `conic-gradient(${stops.join(', ')})`;
    }, [questions.length]);

    const spin = () => {
        if (spinning || questions.length === 0) return;
        setChosen(null);
        setSelected(null);
        setSpinning(true);

        const pick = Math.floor(Math.random() * questions.length);
        const turns = 4 + Math.floor(Math.random() * 3);
        setRotation((r) => r + turns * 360 + Math.floor(Math.random() * 360));

        spinTimer.current = setTimeout(() => {
            setSelected(questions[pick]);
            setSpinning(false);
        }, 1200);
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-5 text-gray-500 shadow-sm">
                Memuat permainan...
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-5 text-gray-500 shadow-sm">
                Soal roda belum tersedia.
            </div>
        );
    }

    // Teks TTS fallback: baca soal + pilihan jawaban
    const questionText = selected
        ? `${selected.question} Pilihan: A, ${selected.options?.a ?? selected.option_a}. B, ${selected.options?.b ?? selected.option_b}. C, ${selected.options?.c ?? selected.option_c}.`
        : '';

    return (
        <div className="card-soft">
            <h3 className="mb-1 text-lg font-bold text-gray-800">Roda Keberuntungan</h3>
            <p className="mb-4 text-sm text-gray-600">
                Putar roda, lalu jawab soal yang muncul. Bisa diulang sesukamu.
            </p>

            {/* Roda */}
            <div className="relative mx-auto mb-4 h-44 w-44">
                <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
                    <div className="h-0 w-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-primary-700" />
                </div>
                <div
                    className="h-44 w-44 rounded-full border-4 border-primary-200 shadow-inner"
                    style={{
                        background: wheelBg,
                        transform: `rotate(${rotation}deg)`,
                        transition: 'transform 1.2s ease-out',
                    }}
                />
                <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary-700 shadow">
                    <i className="fa-solid fa-star" aria-hidden="true" />
                </div>
            </div>

            <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="btn-primary w-full"
            >
                {spinning ? 'Memutar...' : 'Putar Roda'}
            </button>

            {/* Soal terpilih */}
            {selected && (
                <div className="mt-5 rounded-lg border border-primary-100 bg-primary-50 p-4">
                    <p className="font-semibold text-gray-800">{selected.question}</p>

                    {/* Tombol putar audio soal */}
                    <div className="mt-2">
                        <SpeakButton
                            label="Dengarkan soal"
                            audioSrc={selected.audio_url ?? undefined}
                            text={questionText}
                        />
                    </div>

                    <div className="mt-3 space-y-2">
                        {OPTS.map((key) => {
                            const optionText = selected.options ? selected.options[key] : selected[`option_${key}`];
                            const isChosen = chosen === key;
                            const isAnswer = selected.answer === key;
                            let cls = 'border-gray-200 bg-white text-gray-700';
                            if (chosen) {
                                if (isAnswer) cls = 'border-green-300 bg-green-50 text-green-700';
                                else if (isChosen) cls = 'border-red-300 bg-red-50 text-red-700';
                            }
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    disabled={!!chosen}
                                    onClick={() => setChosen(key)}
                                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium ${cls}`}
                                >
                                    <span className="font-bold uppercase">{key}.</span>
                                    {optionText}
                                </button>
                            );
                        })}
                    </div>
                    {chosen && selected.answer && (
                        <p className="mt-3 text-sm font-semibold text-gray-700">
                            {chosen === selected.answer ? 'Benar! Bagus sekali.' : 'Belum tepat, coba lagi nanti ya.'}
                        </p>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={complete}
                className="mt-4 w-full rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary-50"
            >
                Sudah Cukup (Selesai)
            </button>

            <BadgeModal badge={badge} onClose={clearBadge} />
        </div>
    );
}
