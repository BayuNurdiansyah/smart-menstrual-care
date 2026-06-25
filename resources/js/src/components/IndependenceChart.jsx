import React from 'react';
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

/**
 * Grafik tren kemandirian PER BULAN (persen) bertema feminin,
 * dengan interpretasi otomatis di bawahnya.
 *
 * Props:
 *  - trend: [{ period, percent }] (per bulan)
 *  - interpretation: { text, direction } | null
 */
export default function IndependenceChart({ trend = [], interpretation = null }) {
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

    return (
        <div>
            <div className="h-56 w-full rounded-2xl bg-white/70 p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trend} margin={{ top: 12, right: 12, bottom: 4, left: -12 }}>
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

            {/* Interpretasi otomatis */}
            {interpretation?.text && (
                <div className={`mt-3 rounded-xl px-4 py-2 text-center text-sm font-semibold ${dirColor}`}>
                    {/* PLACEHOLDER: <i className="fa-solid fa-arrow-trend-up" /> */}
                    {interpretation.text}
                </div>
            )}
        </div>
    );
}
