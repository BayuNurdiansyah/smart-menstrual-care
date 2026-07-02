import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import SpeakButton from '../../components/SpeakButton';
import IndependenceChart from '../../components/IndependenceChart';
import {
    getCurrentCycle,
    getCycleHistory,
    startCycle,
    getDailyStatus,
    getAssessedDates,
    getAssessmentAnswers,
    getAssessmentQuestions,
    getAssessmentChart,
    submitDailyAssessment,
} from '../../api/tracker';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const OPTIONS = [
    { value: 2, label: 'Bisa Sendiri' },
    { value: 1, label: 'Dengan Bantuan' },
    { value: 0, label: 'Belum Bisa' },
];

const pad = (n) => String(n).padStart(2, '0');
const toYmd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayYmd = () => { const t = new Date(); return toYmd(t.getFullYear(), t.getMonth(), t.getDate()); };

function buildWeeks(year, month) {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= days; d += 1) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
}

function durationDays(start, end) {
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    return Math.floor((e - s) / 86400000) + 1;
}

export default function KalenderTracker() {
    const navigate = useNavigate();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const [current, setCurrent] = useState(null);
    const [history, setHistory] = useState([]);
    const [status, setStatus] = useState({ active: false });
    const [assessedDates, setAssessedDates] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [chart, setChart] = useState({ trend: [], interpretation: null });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    // Modal: { mode:'start', date } | { mode:'assess', date, day, canFinish, editing }
    const [modal, setModal] = useState(null);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);

    const isMenstruating = status.active;
    // Tanggal yang sudah benar-benar terisi (lintas siklus) -> satu-satu, bukan blok rentang.
    const assessedSet = useMemo(() => new Set(assessedDates), [assessedDates]);
    const pendingMap = useMemo(() => {
        const m = new Map();
        (status.pending_dates ?? []).forEach((p) => m.set(p.date, p.day));
        return m;
    }, [status]);
    const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [cur, hist, st, ad, q, ch] = await Promise.all([
                getCurrentCycle(), getCycleHistory(), getDailyStatus(), getAssessedDates(), getAssessmentQuestions(), getAssessmentChart(),
            ]);
            const statusData = st.data.data ?? { active: false };
            setCurrent(cur.data.data ?? null);
            setHistory(hist.data.data ?? []);
            setStatus(statusData);
            setAssessedDates(ad.data.data ?? []);
            setQuestions(q.data.data ?? []);
            setChart(ch.data.data ?? { trend: [], interpretation: null });
            return statusData;
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memuat data.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

    const openAssess = (ymd, day, canFinish, initialAnswers = {}, editing = false) => {
        setAnswers(initialAnswers);
        setFinished(false);
        setModal({ mode: 'assess', date: ymd, day, canFinish, editing });
    };

    // Buka kembali tanggal yang sudah diisi, untuk dikoreksi (antisipasi salah
    // klik). Berlaku kapan saja — termasuk siklus yang sudah auto-closed
    // (lebih dari 10 hari) — bukan cuma selama siklus itu masih berjalan.
    const openAssessForEdit = async (ymd) => {
        setBusy(true); setError('');
        try {
            const res = await getAssessmentAnswers(ymd);
            const data = res.data.data ?? {};
            const prefilled = Object.fromEntries(
                Object.entries(data.answers ?? {}).map(([qid, score]) => [Number(qid), Number(score)])
            );
            const day = data.day ?? 1;
            // "Tandai selesai" hanya masuk akal kalau tanggal ini masih bagian
            // siklus yang SEDANG berjalan sekarang, bukan siklus lama yang diedit.
            const belongsToActiveCycle = isMenstruating && data.cycle_id === status.cycle?.id;
            const canFinish = belongsToActiveCycle && day >= (status.finish_from_day ?? 6);
            openAssess(ymd, day, canFinish, prefilled, true);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memuat jawaban.');
        } finally {
            setBusy(false);
        }
    };

    const onClickDate = (day) => {
        if (!day) return;
        const ymd = toYmd(year, month, day);

        // Tanggal yang sudah pernah diisi selalu bisa dibuka lagi untuk
        // dikoreksi, terlepas dari status siklusnya sekarang.
        if (assessedSet.has(ymd)) {
            openAssessForEdit(ymd);
            return;
        }

        if (isMenstruating) {
            if (pendingMap.has(ymd)) {
                const d = pendingMap.get(ymd);
                openAssess(ymd, d, d >= (status.finish_from_day ?? 6));
            }
            return;
        }
        // Belum menstruasi & tanggal ini belum pernah diisi -> tawarkan mulai.
        setModal({ mode: 'start', date: ymd });
    };

    const confirmStart = async () => {
        setBusy(true); setError('');
        try {
            const startDate = modal.date;
            await startCycle({ start_date: startDate });
            const freshStatus = await load();
            // Hari pertama: langsung buka popup assessment untuk tanggal yang
            // baru saja ditandai, tanpa perlu klik ulang tanggalnya.
            if (freshStatus) {
                const pending = (freshStatus.pending_dates ?? []).find((p) => p.date === startDate);
                const day = pending?.day ?? 1;
                const canFinish = day >= (freshStatus.finish_from_day ?? 6);
                openAssess(startDate, day, canFinish);
            } else {
                setModal(null);
            }
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memulai.');
        } finally { setBusy(false); }
    };

    const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

    const submitAssess = async () => {
        setBusy(true); setError('');
        try {
            await submitDailyAssessment({ date: modal.date, answers, finished });
            setModal(null);
            await load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menyimpan assessment.');
        } finally { setBusy(false); }
    };

    const last = history[0];
    const pendingCount = (status.pending_dates ?? []).length;

    return (
        <MobileLayout title="Kalender Menstruasi" subtitle="Healthy Habit Builder">
            <div className="space-y-5">
                <button type="button" onClick={() => navigate('/murid')} className="text-sm font-semibold text-primary hover:underline">
                    &lsaquo; Kembali
                </button>

                {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                {loading ? (
                    <p className="text-gray-500">Memuat...</p>
                ) : (
                    <>
                        {/* Info status menstruasi */}
                        {isMenstruating && (
                            <div className="rounded-2xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
                                Sedang menstruasi sejak <b>{status.cycle?.start_date}</b>.
                                {pendingCount > 0
                                    ? <> Ada <b>{pendingCount}</b> hari yang perlu diisi assessment — ketuk tanggalnya.</>
                                    : ' Assessment hari ini sudah lengkap.'}
                            </div>
                        )}

                        {/* Navigasi bulan */}
                        <div className="flex items-center justify-between">
                            <button type="button" onClick={prevMonth} className="rounded-lg px-3 py-1 text-primary hover:bg-primary-50" aria-label="Bulan sebelumnya">
                                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                            </button>
                            <h2 className="text-base font-bold text-gray-800">{MONTHS[month]} {year}</h2>
                            <button type="button" onClick={nextMonth} className="rounded-lg px-3 py-1 text-primary hover:bg-primary-50" aria-label="Bulan berikutnya">
                                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Grid kalender */}
                        <div className="card-soft p-3">
                            <div className="mb-1 grid grid-cols-7 text-center text-xs font-semibold text-gray-400">
                                {DOW.map((d) => <div key={d} className="py-1">{d}</div>)}
                            </div>
                            {weeks.map((week, wi) => (
                                <div key={wi} className="grid grid-cols-7">
                                    {week.map((day, di) => {
                                        if (!day) return <div key={di} className="h-10" />;
                                        const ymd = toYmd(year, month, day);
                                        // Pink hanya untuk tanggal yang BENAR-BENAR sudah diisi (satu per satu),
                                        // bukan seluruh rentang siklus sekaligus.
                                        const assessed = assessedSet.has(ymd);
                                        const pending = pendingMap.has(ymd);
                                        const isToday = ymd === todayYmd();
                                        return (
                                            <button
                                                key={di}
                                                type="button"
                                                onClick={() => onClickDate(day)}
                                                className={`relative m-0.5 flex h-9 flex-col items-center justify-center rounded-lg text-sm transition ${
                                                    assessed ? 'bg-primary text-white font-bold' : 'text-gray-700 hover:bg-primary-50'
                                                } ${pending ? 'ring-2 ring-amber-400' : ''} ${isToday && !assessed ? 'ring-2 ring-primary-300' : ''}`}
                                            >
                                                {day}
                                                {assessed && (
                                                    <i className="fa-solid fa-check absolute -bottom-0.5 text-[8px]" aria-hidden="true" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Legenda */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-white"><i className="fa-solid fa-check text-[8px]" /></span> Sudah diisi (ketuk lagi untuk koreksi)</span>
                            <span className="flex items-center gap-1"><span className="h-4 w-4 rounded ring-2 ring-amber-400" /> Perlu diisi</span>
                        </div>

                        {!isMenstruating && (
                            <p className="text-sm text-gray-500">Ketuk tanggal pada kalender untuk menandai <b>mulai menstruasi</b>.</p>
                        )}

                        {/* Ringkasan */}
                        <section className="rounded-2xl bg-gray-50 p-4">
                            <h3 className="text-sm font-bold text-gray-800">Ringkasan</h3>
                            {last ? (
                                <div className="mt-2 space-y-1 text-sm text-gray-700">
                                    <p className="font-semibold">Siklus Terakhir</p>
                                    <p>Mulai: {last.start_date}</p>
                                    <p>Selesai: {last.end_date ?? 'masih berjalan'}</p>
                                    <p>Durasi: {durationDays(last.start_date, last.end_date)} Hari</p>
                                </div>
                            ) : <p className="mt-2 text-sm text-gray-500">Belum ada catatan siklus.</p>}
                        </section>

                        {/* Grafik kemandirian (per bulan, persen) + interpretasi */}
                        <section>
                            <h3 className="mb-2 text-sm font-bold text-gray-800">Grafik Kemandirian</h3>
                            <IndependenceChart trend={chart.trend} interpretation={chart.interpretation} />
                            <p className="mt-2 text-center text-xs text-gray-400">Diisi harian, ditampilkan rata-rata per bulan.</p>
                        </section>
                    </>
                )}
            </div>

            {/* Modal: Mulai menstruasi */}
            {modal?.mode === 'start' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                            <i className="fa-solid fa-droplet text-xl" aria-hidden="true" />
                        </div>
                        <p className="text-sm text-gray-600">Mulai menstruasi pada</p>
                        <p className="mt-1 text-lg font-bold text-gray-800">{modal.date}</p>
                        <div className="mt-5 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={confirmStart} disabled={busy} className="btn-primary flex-1 py-2 text-sm">Mulai</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Assessment harian */}
            {modal?.mode === 'assess' && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Assessment Hari ke-{modal.day}</h3>
                            <button type="button" onClick={() => setModal(null)} className="text-gray-400" aria-label="Tutup"><i className="fa-solid fa-xmark" /></button>
                        </div>
                        <p className="mb-3 text-xs text-gray-500">
                            {modal.date} — {modal.editing ? 'sedang mengoreksi jawaban yang sudah tersimpan.' : 'isi sesuai kemampuanmu hari ini.'}
                        </p>

                        {/* Narasi suara asli (/public/audio/assessment/pertanyaan-harian.mp3); jatuh ke TTS jika belum ada. */}
                        <div className="mb-4">
                            <SpeakButton
                                label="Dengarkan pertanyaan"
                                audioSrc="/audio/assessment/pertanyaan-harian.mp3"
                                text={
                                    `Assessment hari ke ${modal.day}. Pilihan jawaban: ${OPTIONS.map((o) => o.label).join(', ')}. ` +
                                    questions.map((q, i) => `Pertanyaan ${i + 1}. ${q.question_text}.`).join(' ')
                                }
                            />
                        </div>

                        <div className="space-y-4">
                            {questions.map((q, idx) => (
                                <fieldset key={q.id}>
                                    <legend className="text-sm font-semibold text-gray-800">{idx + 1}. {q.question_text}</legend>
                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        {OPTIONS.map((opt) => (
                                            <label key={opt.value} className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium ${answers[q.id] === opt.value ? 'border-primary bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-600'}`}>
                                                <input type="radio" name={`q_${q.id}`} className="sr-only" checked={answers[q.id] === opt.value} onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt.value }))} />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            ))}
                        </div>

                        {/* Pilihan selesai (mulai hari ke-6/7) */}
                        {modal.canFinish && (
                            <label className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} className="mt-0.5" />
                                <span>Menstruasi saya <b>sudah selesai</b> hari ini. (Siklus akan ditutup setelah assessment ini.)</span>
                            </label>
                        )}

                        <button type="button" onClick={submitAssess} disabled={!allAnswered || busy} className="btn-primary mt-5 w-full">
                            {busy ? 'Menyimpan...' : finished ? 'Simpan & Akhiri Menstruasi' : modal.editing ? 'Simpan Perubahan' : 'Simpan Assessment'}
                        </button>
                    </div>
                </div>
            )}
        </MobileLayout>
    );
}
