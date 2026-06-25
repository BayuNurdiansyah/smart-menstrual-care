import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { logoutRequest } from '../../api/auth';
import { listMaterials, deleteMaterial } from '../../api/material';
import { STAGES } from '../../utils/stages';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [stageId, setStageId] = useState(STAGES[0].id);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchMaterials = useCallback(() => {
        setLoading(true);
        setError('');
        listMaterials(stageId)
            .then((res) => setMaterials(res.data.data ?? []))
            .catch((err) => setError(err.response?.data?.message ?? 'Gagal memuat materi.'))
            .finally(() => setLoading(false));
    }, [stageId]);

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus materi ini?')) return;
        try {
            await deleteMaterial(id);
            fetchMaterials();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menghapus materi.');
        }
    };

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

    return (
        <MobileLayout title="Kelola Materi" subtitle="Admin Panel">
            <div className="space-y-5">
                <div className="flex items-center gap-2">
                    <label htmlFor="stage-filter" className="text-sm font-semibold text-gray-700">
                        Tahap
                    </label>
                    <select
                        id="stage-filter"
                        value={stageId}
                        onChange={(e) => setStageId(Number(e.target.value))}
                        className="flex-1 rounded-lg border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                    >
                        {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.id}. {s.title}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="button"
                    onClick={() => navigate('/admin/materials/create')}
                    className="btn-primary w-full text-sm"
                >
                    {/* PLACEHOLDER: <i className="fa-solid fa-plus" /> */}
                    Tambah Materi
                </button>

                {/* Kelola soal */}
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/assessment-questions')}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {/* PLACEHOLDER: <i className="fa-solid fa-clipboard-list" /> */}
                        Kelola Assessment
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/wheel-questions')}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {/* PLACEHOLDER: <i className="fa-solid fa-dharmachakra" /> */}
                        Kelola Roda
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/guardian-links')}
                        className="col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {/* PLACEHOLDER: <i className="fa-solid fa-users" /> */}
                        Relasi Murid–Pengawas
                    </button>
                </div>

                {error && (
                    <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading && <p className="text-gray-500">Memuat...</p>}

                {!loading && materials.length === 0 && (
                    <p className="text-gray-500">Belum ada materi di tahap ini.</p>
                )}

                <ul className="space-y-3">
                    {materials.map((material) => (
                        <li
                            key={material.id}
                            className="card-soft p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="truncate font-semibold text-gray-800">{material.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                        {material.text_content || 'Tanpa teks'}
                                    </p>
                                    {material.youtube_video_id && (
                                        <p className="mt-1 text-xs text-primary-700">
                                            {/* PLACEHOLDER: <i className="fa-brands fa-youtube" /> */}
                                            Video: {material.youtube_video_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/materials/${material.id}/edit`)}
                                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    {/* PLACEHOLDER: <i className="fa-solid fa-pen" /> */}
                                    Ubah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(material.id)}
                                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    {/* PLACEHOLDER: <i className="fa-solid fa-trash" /> */}
                                    Hapus
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>

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
