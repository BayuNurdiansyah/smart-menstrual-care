import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import SpeakButton from '../../components/SpeakButton';
import IndependenceChart from '../../components/IndependenceChart';
import {
    getCurrentCycle,
    getCycleHistory,
    startCycle,
    editCycle,
    getDailyStatus,
    getAssessedDates,
    getAssessmentAnswers,
    getAssessmentQuestions,
    getAssessmentChart,
    submitDailyAssessment,
    deleteAssessment,
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

    const [modal, setModal] = useState(null);
    const [answers, setAnswers] = useState({});
    const [finished, setFinished] = useState(false);

    // state untuk modal edit/akhiri siklus
    const [editDate, setEditDate] = useState('');
    const [editField, setEditField] = useState('start_date');
    const [editCycleId, setEditCycleId] = useState(null);

    // state untuk combined modal (koreksi siklus + assessment sekaligus)
    const [combinedAssessLoading, setCombinedAssessLoading] = useState(false);
    const [combinedAssessData, setCombinedAssessData]       = useState(null);
    const [combinedAnswers, setCombinedAnswers]             = useState({});
    const [combinedFinished, setCombinedFinished]           = useState(false);

    const isMenstruating = status.active;
    const assessedSet = useMemo(() => new Set(assessedDates), [assessedDates]);
    const pendingMap = useMemo(() => {
        const m = new Map();
        (status.pending_dates ?? []).forEach((p) => m.set(p.date, p.day));
        return m;
    }, [status]);
    const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

    // Gabungkan history + current agar siklus aktif juga masuk ke map
    const allCycles = useMemo(() => {
        const seen = new Set();
        const result = [];
        // current bisa saja sudah ada di history, cek id
        if (current) { seen.add(current.id); result.push(current); }
        (history ?? []).forEach((c) => { if (!seen.has(c.id)) result.push(c); });
        return result;
    }, [current, history]);

    const cycleStartSet = useMemo(() => new Set(allCycles.map((c) => c.start_date).filter(Boolean)), [allCycles]);
    const cycleEndSet   = useMemo(() => new Set(allCycles.map((c) => c.end_date).filter(Boolean)), [allCycles]);

    // date → { id, field } untuk keperluan edit
    const cycleDateMap = useMemo(() => {
        const m = new Map();
        allCycles.forEach((c) => {
            if (c.start_date) m.set(c.start_date, { id: c.id, field: 'start_date' });
            if (c.end_date)   m.set(c.end_date,   { id: c.id, field: 'end_date'   });
        });
        return m;
    }, [allCycles]);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [cur, hist, st, ad, q, ch] = await Promise.all([
                getCurrentCycle(), getCycleHistory(), getDailyStatus(),
                getAssessedDates(), getAssessmentQuestions(), getAssessmentChart(),
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

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };
    const nextMonth = () => {
        const today = new Date();
        if (year > today.getFullYear() || (year === today.getFullYear() && month >= today.getMonth())) return;
        if (month === 11) { setMonth(0); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };
    const canGoNext = useMemo(() => {
        const t = new Date();
        return !(year > t.getFullYear() || (year === t.getFullYear() && month >= t.getMonth()));
    }, [year, month]);

    // ── modal assessment ──────────────────────────────────────────────────────
    const openAssess = (ymd, day, canFinish, initialAnswers = {}, editing = false) => {
        setAnswers(initialAnswers);
        setFinished(false);
        setModal({ mode: 'assess', date: ymd, day, canFinish, editing });
    };

    const openAssessForEdit = async (ymd) => {
        setBusy(true); setError('');
        try {
            const res = await getAssessmentAnswers(ymd);
            const data = res.data.data ?? {};
            const prefilled = Object.fromEntries(
                Object.entries(data.answers ?? {}).map(([qid, score]) => [Number(qid), Number(score)])
            );
            const day = data.day ?? 1;
            const belongsToActiveCycle = isMenstruating && data.cycle_id === status.cycle?.id;
            const canFinish = belongsToActiveCycle && day >= (status.finish_from_day ?? 6);
            openAssess(ymd, day, canFinish, prefilled, true);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memuat jawaban.');
        } finally { setBusy(false); }
    };

    // ── logika klik tanggal ───────────────────────────────────────────────────
    const onClickDate = (day) => {
        if (!day) return;
        const ymd = toYmd(year, month, day);
        const today = todayYmd();
        if (ymd > today) return; // tanggal masa depan diabaikan

        // 1. Marker mulai/berakhir siklus → combined modal (koreksi tanggal + assessment)
        if (cycleDateMap.has(ymd)) {
            const { id, field } = cycleDateMap.get(ymd);
            setEditCycleId(id);
            setEditField(field);
            setEditDate(ymd);
            setCombinedAssessLoading(true);
            setCombinedAssessData(null);
            setCombinedAnswers({});
            setCombinedFinished(false);
            setModal({ mode: 'combined', field, date: ymd });
            getAssessmentAnswers(ymd)
                .then((res) => {
                    const data = res.data.data ?? {};
                    setCombinedAssessData(data);
                    const prefilled = Object.fromEntries(
                        Object.entries(data.answers ?? {}).map(([qid, score]) => [Number(qid), Number(score)])
                    );
                    setCombinedAnswers(prefilled);
                })
                .catch(() => setCombinedAssessData({ answers: {}, day: null, cycle_id: null }))
                .finally(() => setCombinedAssessLoading(false));
            return;
        }

        // 2. Sedang menstruasi → tampilkan pilihan aksi
        if (isMenstruating) {
            const hasPending  = pendingMap.has(ymd);
            const hasAssessed = assessedSet.has(ymd);
            setModal({
                mode: 'date_options',
                date: ymd,
                hasPending,
                hasAssessed,
                pendingDay: pendingMap.get(ymd),
            });
            return;
        }

        // 3. Tidak sedang menstruasi, assessment lama → buka edit assessment
        if (assessedSet.has(ymd)) {
            openAssessForEdit(ymd);
            return;
        }

        // 4. Tidak sedang menstruasi, tanggal kosong → tawarkan mulai siklus
        setModal({ mode: 'start', date: ymd });
    };

    // ── konfirmasi mulai siklus ───────────────────────────────────────────────
    const confirmStart = async () => {
        setBusy(true); setError('');
        try {
            const startDate = modal.date ?? modal.newDate;
            await startCycle({ start_date: startDate });
            const freshStatus = await load();
            if (freshStatus?.active) {
                const pending = (freshStatus.pending_dates ?? []).find((p) => p.date === startDate);
                const day = pending?.day ?? 1;
                const canFinish = day >= (freshStatus.finish_from_day ?? 6);
                openAssess(startDate, day, canFinish);
            } else {
                setModal(null);
            }
        } catch (err) {
            // Siklus lama belum ditutup → tampilkan modal khusus tutup dulu
            if (err.response?.data?.error_code === 'already_ongoing') {
                const newDate = modal.date ?? modal.newDate;
                setEditDate(todayYmd());
                setModal({ mode: 'close_old_first', newDate });
            } else {
                setError(err.response?.data?.message ?? 'Gagal memulai.');
            }
        } finally { setBusy(false); }
    };

    // ── tutup siklus lama lalu langsung mulai siklus baru ────────────────────
    const closeOldAndStart = async () => {
        if (!current || !editDate) return;
        setBusy(true); setError('');
        try {
            await editCycle(current.id, { end_date: editDate });
            const startDate = modal.newDate;
            await startCycle({ start_date: startDate });
            const freshStatus = await load();
            if (freshStatus?.active) {
                const pending = (freshStatus.pending_dates ?? []).find((p) => p.date === startDate);
                const day = pending?.day ?? 1;
                const canFinish = day >= (freshStatus.finish_from_day ?? 6);
                openAssess(startDate, day, canFinish);
            } else {
                setModal(null);
            }
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memproses.');
        } finally { setBusy(false); }
    };

    // ── konfirmasi akhiri siklus (pakai editDate yang bisa diubah user) ───────
    const confirmEndCycle = async () => {
        if (!current || !editDate) return;
        setBusy(true); setError('');
        try {
            await editCycle(current.id, { end_date: editDate });
            setModal(null);
            await load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal mengakhiri siklus.');
        } finally { setBusy(false); }
    };

    // ── konfirmasi edit tanggal siklus (start_date atau end_date) ────────────
    const confirmEditCycle = async () => {
        if (!editCycleId || !editDate) return;
        setBusy(true); setError('');
        try {
            await editCycle(editCycleId, { [editField]: editDate });
            setModal(null);
            await load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal memperbarui siklus.');
        } finally { setBusy(false); }
    };

    // ── buka modal akhiri dari tombol shortcut ────────────────────────────────
    const openEndModal = () => {
        setEditDate(todayYmd()); // default hari ini, bisa diubah
        setModal({ mode: 'end_cycle' });
    };

    // ── submit assessment ─────────────────────────────────────────────────────
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

    // ── combined modal: submit assessment ────────────────────────────────────
    const combinedAllAnswered = questions.length > 0 && questions.every((q) => combinedAnswers[q.id] !== undefined);

    const submitCombinedAssess = async () => {
        if (!modal?.date) return;
        setBusy(true); setError('');
        try {
            await submitDailyAssessment({ date: modal.date, answers: combinedAnswers, finished: combinedFinished });
            // Refresh assessment data in modal (tetap buka)
            const res = await getAssessmentAnswers(modal.date);
            const data = res.data.data ?? {};
            setCombinedAssessData(data);
            const prefilled = Object.fromEntries(
                Object.entries(data.answers ?? {}).map(([qid, score]) => [Number(qid), Number(score)])
            );
            setCombinedAnswers(prefilled);
            setCombinedFinished(false);
            await load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menyimpan assessment.');
        } finally { setBusy(false); }
    };

    // ── combined modal: hapus assessment ─────────────────────────────────────
    const deleteCombinedAssess = async () => {
        if (!modal?.date) return;
        setBusy(true); setError('');
        try {
            await deleteAssessment(modal.date);
            setCombinedAssessData({ answers: {}, day: null, cycle_id: null });
            setCombinedAnswers({});
            await load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menghapus assessment.');
        } finally { setBusy(false); }
    };

    const last = history[0];
    const activeCycleDay = isMenstruating && current ? durationDays(current.start_date, null) : 0;

    return (
        <MobileLayout title="Kalender Menstruasi" subtitle="Healthy Habit Builder">
            <div className="space-y-5">
                <button type="button" onClick={() => navigate('/murid')} className="text-sm font-semibold text-primary hover:underline">
                    &lsaquo; Kembali
                </button>

                {error && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                {loading ? <p className="text-gray-500">Memuat...</p> : (
                    <>
                        {/* Banner status aktif */}
                        {isMenstruating && (() => {
                            // Peringatan overdue hanya muncul jika siklus BUKAN baru dibuat hari ini.
                            // Kalau baru dibuat hari ini tapi start_date bulan lalu = sedang input historis.
                            const createdToday = current?.created_at === todayYmd();
                            const overdue = activeCycleDay > 10 && !createdToday;
                            return (
                                <div className={`rounded-2xl px-4 py-3 text-sm space-y-2 ${overdue ? 'bg-amber-50 border border-amber-200 text-amber-900' : 'bg-primary-50 text-primary-800'}`}>
                                    {overdue && (
                                        <p className="font-semibold flex items-center gap-1">
                                            <i className="fa-solid fa-triangle-exclamation text-amber-500" />
                                            Menstruasimu sudah hari ke-{activeCycleDay}. Sudah selesai? Segera tandai berakhir!
                                        </p>
                                    )}
                                    {!overdue && (
                                        <p>
                                            Sedang menstruasi sejak <b>{current?.start_date}</b> (hari ke-{activeCycleDay}).
                                            {(status.pending_dates ?? []).length > 0
                                                ? <> Ada <b>{status.pending_dates.length}</b> hari perlu diisi — ketuk tanggalnya.</>
                                                : ' Assessment hari ini sudah lengkap.'}
                                        </p>
                                    )}
                                    {overdue && (status.pending_dates ?? []).length > 0 && (
                                        <p className="text-xs text-amber-700">
                                            Ada <b>{status.pending_dates.length}</b> hari assessment belum diisi — ketuk tanggalnya di kalender.
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={openEndModal}
                                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${overdue ? 'border-amber-400 bg-white text-amber-700 hover:bg-amber-100' : 'border-primary-400 bg-white text-primary-700 hover:bg-primary-100'}`}
                                    >
                                        <i className="fa-solid fa-flag-checkered mr-1" />
                                        Tandai Menstruasi Berakhir
                                    </button>
                                </div>
                            );
                        })()}

                        {/* Navigasi bulan */}
                        <div className="flex items-center justify-between">
                            <button type="button" onClick={prevMonth} className="rounded-lg px-3 py-1 text-primary hover:bg-primary-50">
                                <i className="fa-solid fa-chevron-left" />
                            </button>
                            <h2 className="text-base font-bold text-gray-800">{MONTHS[month]} {year}</h2>
                            <button
                                type="button"
                                onClick={nextMonth}
                                disabled={!canGoNext}
                                className={`rounded-lg px-3 py-1 ${canGoNext ? 'text-primary hover:bg-primary-50' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <i className="fa-solid fa-chevron-right" />
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
                                        const assessed  = assessedSet.has(ymd);
                                        const pending   = pendingMap.has(ymd);
                                        const isStart   = cycleStartSet.has(ymd);
                                        const isEnd     = cycleEndSet.has(ymd);
                                        const isToday   = ymd === todayYmd();
                                        const isFuture  = ymd > todayYmd();

                                        let bg = '';
                                        if (assessed)        bg = 'bg-primary text-white font-bold';
                                        else if (isStart)    bg = 'bg-green-100 text-green-800 font-bold';
                                        else if (isEnd)      bg = 'bg-blue-100 text-blue-800 font-bold';
                                        else                 bg = 'text-gray-700 hover:bg-primary-50';

                                        return (
                                            <button
                                                key={di}
                                                type="button"
                                                onClick={() => onClickDate(day)}
                                                disabled={isFuture}
                                                className={`relative m-0.5 flex h-10 flex-col items-center justify-center rounded-lg text-sm transition
                                                    ${bg}
                                                    ${pending ? 'ring-2 ring-amber-400' : ''}
                                                    ${isToday && !assessed ? 'ring-2 ring-primary-300' : ''}
                                                    ${isFuture ? 'opacity-25 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="leading-none">{day}</span>
                                                <span className="flex gap-0.5 mt-0.5">
                                                    {assessed && <i className="fa-solid fa-check text-[7px]" />}
                                                    {isStart  && <i className="fa-solid fa-droplet text-[7px] text-green-600" />}
                                                    {isEnd    && <i className="fa-solid fa-flag   text-[7px] text-blue-600"  />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Legenda */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1"><span className="flex h-4 w-4 items-center justify-center rounded bg-primary text-white"><i className="fa-solid fa-check text-[7px]" /></span>Assessment terisi</span>
                            <span className="flex items-center gap-1"><span className="flex h-4 w-4 items-center justify-center rounded bg-green-100 text-green-700"><i className="fa-solid fa-droplet text-[7px]" /></span>Mulai siklus</span>
                            <span className="flex items-center gap-1"><span className="flex h-4 w-4 items-center justify-center rounded bg-blue-100 text-blue-700"><i className="fa-solid fa-flag text-[7px]" /></span>Berakhir</span>
                            <span className="flex items-center gap-1"><span className="h-4 w-4 rounded ring-2 ring-amber-400" />Perlu diisi</span>
                        </div>

                        <p className="text-xs text-gray-500">
                            Ketuk <i className="fa-solid fa-droplet text-green-600" /> atau <i className="fa-solid fa-flag text-blue-600" /> untuk koreksi tanggal siklus.
                            {!isMenstruating && ' Ketuk tanggal kosong untuk mulai siklus baru.'}
                        </p>

                        {/* Ringkasan */}
                        <section className="rounded-2xl bg-gray-50 p-4">
                            <h3 className="text-sm font-bold text-gray-800">Ringkasan</h3>
                            {last ? (
                                <div className="mt-2 space-y-1 text-sm text-gray-700">
                                    <p className="font-semibold">Siklus Terakhir</p>
                                    <p>Mulai: {last.start_date}</p>
                                    <p>Selesai: {last.end_date ?? 'masih berjalan'}</p>
                                    <p>Durasi: {durationDays(last.start_date, last.end_date)} hari</p>
                                </div>
                            ) : <p className="mt-2 text-sm text-gray-500">Belum ada catatan siklus.</p>}
                        </section>

                        {/* Grafik */}
                        <section>
                            <h3 className="mb-2 text-sm font-bold text-gray-800">Grafik Kemandirian</h3>
                            <IndependenceChart trend={chart.trend} interpretation={chart.interpretation} />
                            <p className="mt-2 text-center text-xs text-gray-400">Diisi harian, ditampilkan rata-rata per bulan.</p>
                        </section>
                    </>
                )}
            </div>

            {/* ── Modal: Mulai siklus ─────────────────────────────────────────────── */}
            {modal?.mode === 'start' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                            <i className="fa-solid fa-droplet text-xl" />
                        </div>
                        <p className="text-sm text-gray-600">Mulai menstruasi pada</p>
                        <p className="mt-1 text-lg font-bold text-gray-800">{modal.date}</p>
                        <p className="mt-1 text-xs text-gray-400">Pastikan tanggal sudah benar sebelum melanjutkan.</p>
                        <div className="mt-5 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={confirmStart} disabled={busy} className="btn-primary flex-1 py-2 text-sm">{busy ? 'Memproses...' : 'Ya, Mulai'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Tutup siklus lama dulu sebelum mulai baru ──────────────── */}
            {modal?.mode === 'close_old_first' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                            <i className="fa-solid fa-triangle-exclamation text-xl" />
                        </div>
                        <p className="text-center text-sm font-bold text-gray-800">Siklus Sebelumnya Belum Ditutup</p>
                        <p className="mt-1 text-center text-xs text-gray-500 mb-4">
                            Siklus yang dimulai <b>{current?.start_date}</b> masih berjalan.
                            Tutup dulu sebelum memulai siklus baru pada <b>{modal.newDate}</b>.
                        </p>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Tanggal berakhir siklus lama
                        </label>
                        <input
                            type="date"
                            value={editDate}
                            min={current?.start_date ?? ''}
                            max={todayYmd()}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-400">Isi tanggal kapan mens sebelumnya selesai.</p>
                        <div className="mt-4 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={closeOldAndStart}
                                disabled={busy || !editDate}
                                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                            >
                                {busy ? 'Memproses...' : 'Tutup & Mulai Baru'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Pilihan aksi untuk tanggal saat mens aktif ──────────────── */}
            {modal?.mode === 'date_options' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Tanggal {modal.date}</p>
                        <p className="text-xs text-gray-500 mb-4">Pilih tindakan yang ingin dilakukan:</p>
                        <div className="space-y-2">
                            {(modal.hasPending || modal.hasAssessed) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setModal(null);
                                        if (modal.hasAssessed) {
                                            openAssessForEdit(modal.date);
                                        } else {
                                            const d = modal.pendingDay ?? 1;
                                            openAssess(modal.date, d, d >= (status.finish_from_day ?? 6));
                                        }
                                    }}
                                    className="w-full rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primary-50 text-left"
                                >
                                    <i className="fa-solid fa-clipboard-list mr-2" />
                                    {modal.hasAssessed ? 'Koreksi assessment hari ini' : 'Isi assessment hari ini'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setEditDate(modal.date);
                                    setModal({ mode: 'end_cycle' });
                                }}
                                className="w-full rounded-lg border border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 text-left"
                            >
                                <i className="fa-solid fa-flag-checkered mr-2" />
                                Tandai sebagai tanggal berakhir menstruasi
                            </button>
                        </div>
                        <button type="button" onClick={() => setModal(null)} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600">Batal</button>
                    </div>
                </div>
            )}

            {/* ── Modal: Akhiri siklus (date picker, default hari ini) ───────────── */}
            {modal?.mode === 'end_cycle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                            <i className="fa-solid fa-flag-checkered text-xl" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 text-center">Tandai menstruasi berakhir</p>
                        <p className="mt-1 text-xs text-gray-500 text-center mb-3">Ubah tanggal jika berakhirnya bukan hari ini.</p>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal berakhir</label>
                        <input
                            type="date"
                            value={editDate}
                            min={current?.start_date ?? ''}
                            max={todayYmd()}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                        <div className="mt-4 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={confirmEndCycle} disabled={busy || !editDate} className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                                {busy ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Koreksi tanggal mulai / berakhir siklus (legacy, tidak dipakai lagi) ── */}
            {modal?.mode === 'edit_cycle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
                        <p className="text-sm font-semibold text-gray-800">
                            Koreksi tanggal {editField === 'start_date' ? 'mulai' : 'berakhir'} siklus
                        </p>
                        <p className="mt-1 text-xs text-gray-400 mb-3">Ubah ke tanggal yang benar lalu tekan Simpan.</p>
                        <input
                            type="date"
                            value={editDate}
                            max={todayYmd()}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                        <div className="mt-4 flex gap-3">
                            <button type="button" onClick={() => setModal(null)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                            <button type="button" onClick={confirmEditCycle} disabled={busy || !editDate} className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">
                                {busy ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Combined — Koreksi tanggal siklus + Assessment ─────────── */}
            {modal?.mode === 'combined' && (() => {
                const hasExistingAssess = combinedAssessData && Object.keys(combinedAssessData.answers ?? {}).length > 0;
                const day = combinedAssessData?.day ?? null;
                const belongsToActiveCycle = isMenstruating && combinedAssessData?.cycle_id === status.cycle?.id;
                const canFinish = belongsToActiveCycle && day !== null && day >= (status.finish_from_day ?? 6);
                // min tanggal untuk date picker: jika mengedit end_date, tidak boleh < start_date siklus
                const editedCycle = allCycles.find((c) => c.id === editCycleId);
                const dateMin = modal.field === 'end_date' ? (editedCycle?.start_date ?? '') : '';
                return (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
                        <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white shadow-xl sm:rounded-3xl">
                            {/* Header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">
                                        {modal.field === 'start_date' ? 'Tanggal Mulai Menstruasi' : 'Tanggal Berakhir Menstruasi'}
                                    </p>
                                    <p className="text-xs text-gray-500">{modal.date}</p>
                                </div>
                                <button type="button" onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                                    <i className="fa-solid fa-xmark text-lg" />
                                </button>
                            </div>

                            <div className="space-y-5 p-5">
                                {/* ── Seksi 1: Koreksi tanggal siklus ── */}
                                <section className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        Koreksi Tanggal {modal.field === 'start_date' ? 'Mulai' : 'Berakhir'}
                                    </p>
                                    <p className="mb-3 text-xs text-gray-400">Ubah jika salah input tanggal sebelumnya.</p>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal</label>
                                    <input
                                        type="date"
                                        value={editDate}
                                        min={dateMin}
                                        max={todayYmd()}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={confirmEditCycle}
                                        disabled={busy || !editDate}
                                        className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60"
                                    >
                                        {busy ? 'Menyimpan...' : 'Simpan Koreksi Tanggal'}
                                    </button>
                                </section>

                                {/* ── Seksi 2: Assessment ── */}
                                <section className="rounded-xl border border-gray-200 p-4">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                                        Assessment Harian
                                        {day !== null && <span className="ml-1 normal-case font-normal text-gray-400">— hari ke-{day}</span>}
                                    </p>

                                    {combinedAssessLoading ? (
                                        <p className="py-4 text-center text-sm text-gray-400">Memuat...</p>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <SpeakButton
                                                    label="Dengarkan pertanyaan"
                                                    audioSrc="/audio/assessment/pertanyaan-harian.mp3"
                                                    text={
                                                        `Assessment${day !== null ? ` hari ke ${day}` : ''}. Pilihan: ${OPTIONS.map((o) => o.label).join(', ')}. ` +
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
                                                                <label key={opt.value} className={`cursor-pointer rounded-lg border px-2 py-2 text-center text-xs font-medium ${combinedAnswers[q.id] === opt.value ? 'border-primary bg-primary-50 text-primary-800' : 'border-gray-200 text-gray-600'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`cq_${q.id}`}
                                                                        className="sr-only"
                                                                        checked={combinedAnswers[q.id] === opt.value}
                                                                        onChange={() => setCombinedAnswers((p) => ({ ...p, [q.id]: opt.value }))}
                                                                    />
                                                                    {opt.label}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </fieldset>
                                                ))}
                                            </div>

                                            {canFinish && (
                                                <label className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                                    <input type="checkbox" checked={combinedFinished} onChange={(e) => setCombinedFinished(e.target.checked)} className="mt-0.5" />
                                                    <span>Menstruasi saya <b>sudah selesai</b> hari ini.</span>
                                                </label>
                                            )}

                                            <button
                                                type="button"
                                                onClick={submitCombinedAssess}
                                                disabled={!combinedAllAnswered || busy}
                                                className="btn-primary mt-4 w-full"
                                            >
                                                {busy ? 'Menyimpan...' : combinedFinished ? 'Simpan & Akhiri Menstruasi' : hasExistingAssess ? 'Simpan Perubahan Assessment' : 'Simpan Assessment'}
                                            </button>

                                            {hasExistingAssess && (
                                                <button
                                                    type="button"
                                                    onClick={deleteCombinedAssess}
                                                    disabled={busy}
                                                    className="mt-2 w-full rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                                                >
                                                    <i className="fa-solid fa-trash mr-1" />
                                                    Hapus Assessment
                                                </button>
                                            )}
                                        </>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── Modal: Assessment harian ───────────────────────────────────────── */}
            {modal?.mode === 'assess' && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
                    <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Assessment Hari ke-{modal.day}</h3>
                            <button type="button" onClick={() => setModal(null)} className="text-gray-400"><i className="fa-solid fa-xmark" /></button>
                        </div>
                        <p className="mb-3 text-xs text-gray-500">
                            {modal.date} — {modal.editing ? 'sedang mengoreksi jawaban.' : 'isi sesuai kemampuanmu hari ini.'}
                        </p>
                        <div className="mb-4">
                            <SpeakButton
                                label="Dengarkan pertanyaan"
                                audioSrc="/audio/assessment/pertanyaan-harian.mp3"
                                text={
                                    `Assessment hari ke ${modal.day}. Pilihan: ${OPTIONS.map((o) => o.label).join(', ')}. ` +
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
                        {modal.canFinish && (
                            <label className="mt-4 flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                                <input type="checkbox" checked={finished} onChange={(e) => setFinished(e.target.checked)} className="mt-0.5" />
                                <span>Menstruasi saya <b>sudah selesai</b> hari ini.</span>
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
