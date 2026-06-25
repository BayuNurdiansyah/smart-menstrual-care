import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { registerRequest } from '../../api/auth';

const ROLE_OPTIONS = [
    { value: 'murid', label: 'Murid' },
    { value: 'ortu', label: 'Orang Tua' },
    { value: 'guru', label: 'Guru' },
];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'murid',
        kelas: '',
        date_of_birth: '',
        region: '',
        guardian_email: '',
    });
    const isSimple = form.role === 'murid' || form.role === 'ortu';
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const fieldError = (name) => errors[name]?.[0];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        setLoading(true);
        try {
            // Kirim hanya field yang relevan dengan role-nya.
            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
                date_of_birth: form.date_of_birth || undefined,
                region: form.region || undefined,
            };
            if (isSimple) {
                payload.kelas = form.kelas;
                if (form.role === 'murid' && form.guardian_email) {
                    payload.guardian_email = form.guardian_email;
                }
            } else {
                payload.password = form.password;
                payload.password_confirmation = form.password_confirmation;
            }

            await registerRequest(payload);
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err) {
            // 422 -> error per-field; selainnya -> pesan umum.
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors ?? {});
            }
            setMessage(err.response?.data?.message ?? 'Pendaftaran gagal. Coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border-gray-300 px-4 py-3 text-base focus:border-primary focus:ring-primary';

    return (
        <MobileLayout title="Daftar" subtitle="Buat akun Smart Menstrual Care">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {message && (
                    <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {message}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">
                        Nama Lengkap
                    </label>
                    <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} className={inputClass} />
                    {fieldError('name') && <p className="mt-1 text-xs text-red-600">{fieldError('name')}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                        Email
                    </label>
                    <input id="email" name="email" type="email" autoComplete="email" required value={form.email} onChange={handleChange} className={inputClass} />
                    {fieldError('email') && <p className="mt-1 text-xs text-red-600">{fieldError('email')}</p>}
                </div>

                <div>
                    <label htmlFor="role" className="mb-1 block text-sm font-semibold text-gray-700">
                        Peran
                    </label>
                    <select id="role" name="role" value={form.role} onChange={handleChange} className={inputClass}>
                        {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {fieldError('role') && <p className="mt-1 text-xs text-red-600">{fieldError('role')}</p>}
                </div>

                {/* Kelas: wajib & dipakai untuk login murid/ortu */}
                {isSimple && (
                    <div>
                        <label htmlFor="kelas" className="mb-1 block text-sm font-semibold text-gray-700">
                            Kelas
                        </label>
                        <input id="kelas" name="kelas" type="text" required value={form.kelas} onChange={handleChange} className={inputClass} placeholder="mis. 7A" />
                        <p className="mt-1 text-xs text-gray-400">Nama + kelas dipakai untuk login. Pastikan mudah diingat.</p>
                        {fieldError('kelas') && <p className="mt-1 text-xs text-red-600">{fieldError('kelas')}</p>}
                    </div>
                )}

                <div>
                    <label htmlFor="date_of_birth" className="mb-1 block text-sm font-semibold text-gray-700">
                        Tanggal Lahir <span className="font-normal text-gray-400">(opsional)</span>
                    </label>
                    <input id="date_of_birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className={inputClass} />
                    {fieldError('date_of_birth') && <p className="mt-1 text-xs text-red-600">{fieldError('date_of_birth')}</p>}
                </div>

                <div>
                    <label htmlFor="region" className="mb-1 block text-sm font-semibold text-gray-700">
                        Wilayah Akun (Alamat) <span className="font-normal text-gray-400">(opsional)</span>
                    </label>
                    <input id="region" name="region" type="text" value={form.region} onChange={handleChange} className={inputClass} placeholder="mis. Surakarta, Jawa Tengah" />
                    {fieldError('region') && <p className="mt-1 text-xs text-red-600">{fieldError('region')}</p>}
                </div>

                {/* Email pengawas hanya relevan untuk murid (Opsi A) */}
                {form.role === 'murid' && (
                    <div>
                        <label htmlFor="guardian_email" className="mb-1 block text-sm font-semibold text-gray-700">
                            Email Orang Tua/Guru <span className="font-normal text-gray-400">(opsional)</span>
                        </label>
                        <input id="guardian_email" name="guardian_email" type="email" value={form.guardian_email} onChange={handleChange} className={inputClass} placeholder="email pengawas yang sudah terdaftar" />
                        <p className="mt-1 text-xs text-gray-400">Isi jika pengawas sudah punya akun, agar terhubung otomatis. Bisa dikosongkan dan ditautkan admin nanti.</p>
                        {fieldError('guardian_email') && <p className="mt-1 text-xs text-red-600">{fieldError('guardian_email')}</p>}
                    </div>
                )}

                {/* Password hanya untuk Guru (murid/ortu login pakai nama+kelas) */}
                {!isSimple && (
                    <>
                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                                Kata Sandi
                            </label>
                            <input id="password" name="password" type="password" autoComplete="new-password" required value={form.password} onChange={handleChange} className={inputClass} />
                            {fieldError('password') && <p className="mt-1 text-xs text-red-600">{fieldError('password')}</p>}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-semibold text-gray-700">
                                Konfirmasi Kata Sandi
                            </label>
                            <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required value={form.password_confirmation} onChange={handleChange} className={inputClass} />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                >
                    {loading ? 'Memproses...' : 'Daftar'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Masuk
                    </Link>
                </p>
            </form>
        </MobileLayout>
    );
}
