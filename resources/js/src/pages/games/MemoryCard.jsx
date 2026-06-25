import React, { useEffect, useState } from 'react';
import useGameFinish from '../../hooks/useGameFinish';
import BadgeModal from '../../components/BadgeModal';

// 4 pasang kartu (8 kartu). Icon = Font Awesome Free.
const PAIRS = [
    { type: 'sabun', icon: 'fa-solid fa-soap', label: 'Sabun' },
    { type: 'pembalut', icon: 'fa-solid fa-bandage', label: 'Pembalut' },
    { type: 'air', icon: 'fa-solid fa-droplet', label: 'Air' },
    { type: 'sampah', icon: 'fa-solid fa-trash-can', label: 'Tempat Sampah' },
];

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildDeck = () =>
    shuffle(
        PAIRS.flatMap((pair) => [
            { uid: `${pair.type}-a`, ...pair },
            { uid: `${pair.type}-b`, ...pair },
        ])
    );

export default function MemoryCard({ stageId }) {
    const [deck, setDeck] = useState(buildDeck);
    const [flipped, setFlipped] = useState([]); // uid kartu yang sedang terbuka
    const [matched, setMatched] = useState([]); // type yang sudah cocok
    const [moves, setMoves] = useState(0);
    const [lock, setLock] = useState(false);
    const [result, setResult] = useState(null); // { score } setelah selesai

    const { finish, badge, clearBadge } = useGameFinish(stageId);

    const isMatched = (card) => matched.includes(card.type);
    const isFlipped = (card) => flipped.includes(card.uid);

    // Evaluasi tiap kali 2 kartu terbuka.
    useEffect(() => {
        if (flipped.length !== 2) return;

        setMoves((m) => m + 1);
        setLock(true);

        const [a, b] = flipped.map((uid) => deck.find((c) => c.uid === uid));
        if (a.type === b.type) {
            setMatched((prev) => [...prev, a.type]);
            setFlipped([]);
            setLock(false);
        } else {
            const t = setTimeout(() => {
                setFlipped([]);
                setLock(false);
            }, 800);
            return () => clearTimeout(t);
        }
    }, [flipped, deck]);

    // Semua cocok -> kirim skor + tandai tahap selesai (sekali).
    useEffect(() => {
        if (matched.length !== PAIRS.length || result) return;

        // Skor 0-100: makin sedikit langkah makin tinggi (minimal 4 langkah = 100).
        const score = Math.max(0, Math.round((PAIRS.length / Math.max(moves, PAIRS.length)) * 100));
        setResult({ score });
        finish('memory_card', score);
    }, [matched, moves, result, finish]);

    const handleClick = (card) => {
        if (lock || isMatched(card) || isFlipped(card) || flipped.length === 2) return;
        setFlipped((prev) => [...prev, card.uid]);
    };

    const reset = () => {
        setDeck(buildDeck());
        setFlipped([]);
        setMatched([]);
        setMoves(0);
        setLock(false);
        setResult(null);
    };

    return (
        <div className="card-soft">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Memory Card</h3>
                <span className="text-sm text-gray-500">Langkah: {moves}</span>
            </div>

            {result ? (
                <div className="space-y-4 text-center">
                    <div className="rounded-lg bg-green-50 px-4 py-6 text-green-700">
                        {/* PLACEHOLDER: <i className="fa-solid fa-circle-check" /> */}
                        <p className="text-lg font-bold">Hebat! Semua kartu cocok.</p>
                        <p className="mt-1 text-sm">Skor kamu: {result.score} (dalam {moves} langkah)</p>
                    </div>
                    <button
                        type="button"
                        onClick={reset}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600"
                    >
                        Main Lagi
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-4 gap-2">
                    {deck.map((card) => {
                        const open = isFlipped(card) || isMatched(card);
                        return (
                            <button
                                key={card.uid}
                                type="button"
                                onClick={() => handleClick(card)}
                                aria-label={open ? card.label : 'Kartu tertutup'}
                                className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-center transition ${
                                    open
                                        ? 'border-primary bg-primary-50'
                                        : 'border-gray-200 bg-gray-100 hover:bg-gray-200'
                                }`}
                            >
                                {open ? (
                                    <>
                                        {/* PLACEHOLDER ikon FA */}
                                        <i className={`${card.icon} text-xl text-primary-700`} aria-hidden="true" />
                                        <span className="mt-1 text-[10px] font-semibold leading-tight text-gray-600">
                                            {card.label}
                                        </span>
                                    </>
                                ) : (
                                    <i className="fa-solid fa-question text-lg text-gray-400" aria-hidden="true" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <BadgeModal badge={badge} onClose={clearBadge} />
        </div>
    );
}
