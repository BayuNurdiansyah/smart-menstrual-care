import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import IndependenceChart from '../../components/IndependenceChart';
import { getAssessmentChart, getDailyStatus } from '../../api/tracker';

export default function Assessment() {
    const navigate = useNavigate();
    const [trend, setTrend] = useState([]);
    const [status, setStatus] = useState({ active: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        Promise.all([getAssessmentChart(), getDailyStatus()])
            .then(([c, s]) => {
                if (!active) return;
                setTrend(c.data.data?.trend ?? []);
                setStatus(s.data.data ?? { active: false });
            })
            .catch(() => {})
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    const pendingCount = (status.pending_dates ?? []).length;

    return (
        <MobileLayout title="Self-Assessment" subtitle="Kemandirian Perawatan Diri">
            <div className="space-y-6">
                <button type="button" onClick={() => navigate('/murid')} className="text-sm font-semibold text-primary hover:underline">
                    &lsaquo; Kembali
                </button>

                {/* Info pengisian harian */}
                <div className="rounded-2xl bg-pink-50 p-4 text-sm text-primary-800">
                    Assessment kini diisi <b>setiap hari selama menstruasi</b> melalui Kalender.
                    {status.active
                        ? (pendingCount > 0
                            ? <> Masih ada <b>{pendingCount}</b> hari yang perlu diisi.</>
                            : ' Pengisian hari ini sudah lengkap.')
                        : ' Mulai menstruasi dari Kalender untuk mengisi assessment harian.'}
                    <button type="button" onClick={() => navigate('/murid/tracker')} className="btn-primary mt-3 w-full text-sm">
                        Buka Kalender
                    </button>
                </div>

                {/* Grafik kemandirian */}
                <section>
                    <h2 className="mb-2 text-base font-bold text-gray-800">Grafik Kemandirian</h2>
                    {loading ? <p className="text-gray-500">Memuat...</p> : <IndependenceChart trend={trend} />}
                    <p className="mt-2 text-center text-xs text-gray-400">Tiap titik = skor kemandirian per hari menstruasi.</p>
                </section>
            </div>
        </MobileLayout>
    );
}
