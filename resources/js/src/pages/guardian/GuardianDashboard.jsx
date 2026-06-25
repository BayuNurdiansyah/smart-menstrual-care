import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import IndependenceChart from '../../components/IndependenceChart';
import { useAuth } from '../../context/AuthContext';
import { logoutRequest } from '../../api/auth';
import { getMyStudents, getStudentSummary } from '../../api/guardian';

export default function GuardianDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [students, setStudents] = useState([]);
    const [selectedId, setSelectedId] = useState('');
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Ambil daftar anak didik sekali di awal.
    useEffect(() => {
        getMyStudents()
            .then((res) => {
                const list = res.data.data ?? [];
                setStudents(list);
                if (list.length > 0) setSelectedId(String(list[0].id));
                else setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message ?? 'Gagal memuat daftar murid.');
                setLoading(false);
            });
    }, []);

    // Ambil ringkasan tiap kali murid terpilih berubah.
    useEffect(() => {
        if (!selectedId) return;
        setLoading(true);
        setError('');
        getStudentSummary(selectedId)
            .then((res) => setSummary(res.data.data ?? null))
            .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat ringkasan.'))
            .finally(() => setLoading(false));
    }, [selectedId]);

    const handleLogout = async () => {
        try {
            await logoutRequest();
        } catch {
            // abaikan
        } finally {
            logout();
            navigate('/login', { replace: true });
        }
    };

    const cycle = summary?.last_cycle;

    return (
        <MobileLayout title="Dashboard Pengawas" subtitle="Pantau perkembangan anak didik">
            <div className="space-y-6">
                {/* Pemilih murid (bila lebih dari satu) */}
                {students.length > 0 && (
                    <div>
                        <label htmlFor="student" className="mb-1 block text-sm font-semibold text-gray-700">
                            Pilih Murid
                        </label>
                        <select
                            id="student"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                            className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                        >
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {error && (
                    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading && <p className="text-gray-500">Memuat...</p>}

                {!loading && students.length === 0 && (
                    <p className="text-gray-500">Belum ada murid yang Anda dampingi.</p>
                )}

                {!loading && summary && (
                    <>
                        {/* (A) Riwayat siklus terakhir */}
                        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 p-5 shadow-sm">
                            <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-3 -top-3 w-14 opacity-40" />
                            <h2 className="text-sm font-semibold text-primary-700">Siklus Terakhir</h2>
                            {cycle ? (
                                <div className="mt-1 text-sm text-gray-700">
                                    <p className="text-lg font-bold text-gray-800">
                                        {/* PLACEHOLDER: <i className="fa-solid fa-droplet" /> */}
                                        {cycle.start_date} &rarr; {cycle.end_date ?? 'berjalan'}
                                    </p>
                                    <p className="mt-1">
                                        Status: {cycle.status === 'ongoing' ? 'Sedang menstruasi' : 'Selesai'}
                                        {cycle.auto_closed ? ' (ditutup otomatis)' : ''}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-gray-500">Belum ada data siklus.</p>
                            )}
                        </section>

                        {/* (B) Grafik kemandirian (komponen reusable) */}
                        <section>
                            <h2 className="mb-2 text-base font-bold text-gray-800">Grafik Kemandirian</h2>
                            <IndependenceChart trend={summary.chart?.trend ?? []} interpretation={summary.chart?.interpretation} />
                        </section>

                        {/* (C) Badges / achievement */}
                        <section>
                            <h2 className="mb-3 text-base font-bold text-gray-800">Pencapaian</h2>
                            {summary.badges?.length > 0 ? (
                                <ul className="grid grid-cols-2 gap-3">
                                    {summary.badges.map((badge) => (
                                        <li
                                            key={badge.id}
                                            className="flex items-center gap-2 rounded-2xl border border-pink-100 bg-white p-3 shadow-sm"
                                        >
                                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-300 to-primary-500 text-white">
                                                {/* PLACEHOLDER ikon badge */}
                                                <i className={badge.icon ?? 'fa-solid fa-medal'} aria-hidden="true" />
                                            </span>
                                            <span className="text-sm font-semibold text-gray-800">{badge.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">Belum ada badge yang dikumpulkan.</p>
                            )}
                        </section>
                    </>
                )}

                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                    Keluar
                </button>
            </div>
        </MobileLayout>
    );
}
