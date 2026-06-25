import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { roleHome } from '../../utils/roles';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [mode, setMode] = useState('simple'); // 'simple' (murid/ortu) | 'staff' (admin/guru)
    const [form, setForm] = useState({ name: '', kelas: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload =
                mode === 'simple'
                    ? { name: form.name, kelas: form.kelas }
                    : { email: form.email, password: form.password };
            const { data } = await loginRequest(payload);
            login(data.access_token, data.user);
            navigate(roleHome(data.user.role), { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal masuk. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border-gray-300 px-4 py-3 text-base focus:border-primary focus:ring-primary';

    return (
        <MobileLayout title="Masuk" subtitle="Smart Menstrual Care">
            {/* Pilih jenis akun */}
            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                <button
                    type="button"
                    onClick={() => { setMode('simple'); setError(''); }}
                    className={`rounded-md py-2 text-sm font-semibold transition ${mode === 'simple' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                    Murid / Orang Tua
                </button>
                <button
                    type="button"
                    onClick={() => { setMode('staff'); setError(''); }}
                    className={`rounded-md py-2 text-sm font-semibold transition ${mode === 'staff' ? 'bg-primary text-white' : 'text-gray-600'}`}
                >
                    Admin / Guru
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                    <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {mode === 'simple' ? (
                    <>
                        <div>
                            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">Nama Lengkap</label>
                            <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className={inputClass} placeholder="Nama sesuai pendaftaran" />
                        </div>
                        <div>
                            <label htmlFor="kelas" className="mb-1 block text-sm font-semibold text-gray-700">Kelas</label>
                            <input id="kelas" name="kelas" type="text" required value={form.kelas} onChange={handleChange} className={inputClass} placeholder="mis. 7A" />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">Email</label>
                            <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} className={inputClass} placeholder="nama@email.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">Kata Sandi</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={form.password} onChange={handleChange} className={inputClass} placeholder="••••••••" />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                >
                    {loading ? 'Memproses...' : 'Masuk'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Belum punya akun?{' '}
                    <Link to="/register" className="font-semibold text-primary hover:underline">Daftar</Link>
                </p>
            </form>
        </MobileLayout>
    );
}
