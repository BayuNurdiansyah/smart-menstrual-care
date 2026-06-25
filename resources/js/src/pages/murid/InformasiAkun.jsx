import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { useAuth } from '../../context/AuthContext';
import { meRequest, logoutRequest } from '../../api/auth';

function Row({ label, value }) {
    return (
        <div className="flex justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-right text-sm font-semibold text-gray-800">{value || '-'}</span>
        </div>
    );
}

export default function InformasiAkun() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [data, setData] = useState(user);

    // Ambil data terbaru dari server (jaga-jaga ada perubahan).
    useEffect(() => {
        meRequest()
            .then((res) => setData(res.data.data ?? res.data))
            .catch(() => {});
    }, []);

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

    const u = data ?? {};

    return (
        <MobileLayout title="Informasi Akun" subtitle="Data sesuai pendaftaran">
            <div className="space-y-5">
                <button
                    type="button"
                    onClick={() => navigate('/murid')}
                    className="text-sm font-semibold text-primary hover:underline"
                >
                    {/* PLACEHOLDER: <i className="fa-solid fa-arrow-left" /> */}
                    &lsaquo; Kembali
                </button>

                {/* Kartu identitas */}
                <div className="flex items-center gap-4 rounded-xl bg-primary-50 p-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                        {/* PLACEHOLDER: <i className="fa-solid fa-user" /> */}
                        {(u.name ?? '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold text-gray-800">{u.name ?? '-'}</p>
                        <p className="text-sm text-primary-700">{u.role_label ?? u.role ?? '-'}</p>
                    </div>
                </div>

                {/* Detail data registrasi */}
                <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                    <Row label="Nama Lengkap" value={u.name} />
                    <Row label="Peran" value={u.role_label ?? u.role} />
                    <Row label="Kelas" value={u.kelas} />
                    <Row label="Email" value={u.email} />
                    <Row label="Tanggal Lahir" value={u.date_of_birth} />
                    <Row label="Wilayah Akun" value={u.region} />
                    <Row
                        label="Status"
                        value={u.email_verified ? 'Terverifikasi' : 'Belum verifikasi'}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                    {/* PLACEHOLDER: <i className="fa-solid fa-right-from-bracket" /> */}
                    Keluar
                </button>
            </div>
        </MobileLayout>
    );
}
