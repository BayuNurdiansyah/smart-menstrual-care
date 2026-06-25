import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { listGuardianLinks, attachGuardian, detachGuardian } from '../../api/admin';

export default function GuardianLinksAdmin() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [guardians, setGuardians] = useState([]);
    const [selected, setSelected] = useState({}); // { [studentId]: guardianId }
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        listGuardianLinks()
            .then((r) => {
                setStudents(r.data.students ?? []);
                setGuardians(r.data.guardians ?? []);
            })
            .catch(() => setError('Gagal memuat data.'))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const add = async (studentId) => {
        const gid = selected[studentId];
        if (!gid) return;
        setError('');
        try {
            await attachGuardian(studentId, Number(gid));
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menautkan.');
        }
    };

    const remove = async (studentId, guardianId) => {
        if (!window.confirm('Lepas tautan pengawas ini?')) return;
        try {
            await detachGuardian(studentId, guardianId);
            load();
        } catch {
            setError('Gagal melepas tautan.');
        }
    };

    const roleLabel = (r) => (r === 'guru' ? 'Guru' : 'Orang Tua');

    return (
        <MobileLayout title="Relasi Murid–Pengawas" subtitle="Tautkan murid dengan ortu/guru">
            <div className="space-y-4">
                <button onClick={() => navigate('/admin')} className="text-sm font-semibold text-primary hover:underline">&lsaquo; Kembali</button>
                {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                {loading ? (
                    <p className="text-gray-500">Memuat...</p>
                ) : students.length === 0 ? (
                    <p className="text-gray-500">Belum ada akun murid.</p>
                ) : (
                    <ul className="space-y-3">
                        {students.map((s) => (
                            <li key={s.id} className="rounded-xl border border-gray-100 p-4">
                                <p className="font-bold text-gray-800">{s.name}</p>
                                <p className="text-xs text-gray-500">{s.email}</p>

                                {/* Pengawas saat ini */}
                                <div className="mt-2 space-y-1">
                                    {s.guardians.length === 0 && <p className="text-xs text-gray-400">Belum ada pengawas.</p>}
                                    {s.guardians.map((g) => (
                                        <div key={g.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                                            <span className="text-gray-700">{g.name} <span className="text-xs text-gray-400">({roleLabel(g.role)})</span></span>
                                            <button onClick={() => remove(s.id, g.id)} className="text-xs text-red-600">Lepas</button>
                                        </div>
                                    ))}
                                </div>

                                {/* Tambah pengawas */}
                                <div className="mt-3 flex gap-2">
                                    <select
                                        value={selected[s.id] ?? ''}
                                        onChange={(e) => setSelected({ ...selected, [s.id]: e.target.value })}
                                        className="flex-1 rounded-lg border-gray-300 px-3 py-2 text-sm"
                                    >
                                        <option value="">Pilih pengawas...</option>
                                        {guardians.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name} ({roleLabel(g.role)})</option>
                                        ))}
                                    </select>
                                    <button onClick={() => add(s.id)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Tautkan</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </MobileLayout>
    );
}
