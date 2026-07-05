import React, { useMemo, useState } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const PAGE_SIZE = 4;

/**
 * Grafik tren kemandirian PER BULAN, menampilkan 4 bulan per jendela.
 * Bulan-bulan yang lebih lama dikelompokkan menjadi tombol ringkasan di bawah.
 *
 * Props:
 *  - trend: [{ period, percent }] (urutan terlama → terbaru)
 *  - interpretation: { text, direction } | null
 */
export default function IndependenceChart({ trend = [], interpretation = null }) {
    // page 0 = jendela terbaru, page 1 = sebelumnya, dst.
    const [page, setPage] = useState(0);

    // Kelompokkan trend menjadi jendela PAGE_SIZE bulan (terbaru di indeks 0)
    const windows = useMemo(() => {
        const reversed = [...trend].reverse();
        const groups = [];
        for (let i = 0; i < reversed.length; i += PAGE_SIZE) {
            groups.push([...reversed.slice(i, i + PAGE_SIZE)].reverse());
        }
        return groups;
    }, [trend]);

    const dirColor =
        interpretation?.direction === 'meningkat'
            ? 'text-green-700 bg-green-50'
            : interpretation?.direction === 'menurun'
                ? 'text-red-700 bg-red-50'
                : 'text-primary-800 bg-pink-50';

    if (!trend.length) {
        return (
            <div className="rounded-2xl bg-pink-50/70 px-4 py-8 text-center text-sm text-gray-500">
                Belum ada data assessment untuk ditampilkan.
            </div>
        );
    }

    const currentWindow = windows[page] ?? [];
    const totalPages = windows.length;

    const label = (w) => {
        if (!w.length) return '';
        if (w.length === 1) return w[0].period;
        return `${w[0].period} – ${w[w.length - 1].period}`;
    };

    return (
        <div>
            {/* Grafik jendela aktif */}
            <div className="h-56 w-full rounded-2xl bg-white/70 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={currentWindow} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
                        <defs>
                            <linearGradient id="smcArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e879a0" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#e879a0" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#fbcfe4" />
                        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9d2c54' }} axisLine={{ stroke: '#f9a8cc' }} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#9d2c54' }} axisLine={false} tickLine={false} />
                        <Tooltip
                            formatter={(v) => [`${v}%`, 'Kemandirian']}
                            contentStyle={{ borderRadius: 12, border: '1px solid #fbcfe4', fontSize: 12 }}
                            labelStyle={{ color: '#9d2c54', fontWeight: 700 }}
                        />
                        <Area type="monotone" dataKey="percent" stroke="none" fill="url(#smcArea)" />
                        <Line
                            type="monotone"
                            dataKey="percent"
                            name="Kemandirian"
                            stroke="#e879a0"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#e879a0', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Navigasi jendela bulan */}
            {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                    >
                        <i className="fa-solid fa-chevron-left mr-1" aria-hidden="true" />
                        Lebih lama
                    </button>
                    <span className="text-xs text-gray-500 text-center flex-1">{label(currentWindow)}</span>
                    <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                    >
                        Terbaru
                        <i className="fa-solid fa-chevron-right ml-1" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Tombol ringkasan jendela lama */}
            {totalPages > 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {windows.map((w, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i)}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                i === page
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                            }`}
                        >
                            {label(w)}
                        </button>
                    ))}
                </div>
            )}

            {/* Interpretasi otomatis (hanya di jendela terbaru) */}
            {page === 0 && interpretation?.text && (
                <div className={`mt-3 rounded-xl px-4 py-2 text-center text-sm font-semibold ${dirColor}`}>
                    {interpretation.text}
                </div>
            )}
        </div>
    );
}
