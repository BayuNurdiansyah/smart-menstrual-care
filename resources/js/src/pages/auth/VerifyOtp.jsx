import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { verifyOtpRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { roleHome } from '../../utils/roles';

// Backend membuat & memvalidasi OTP 6 digit (VerifyOtpRequest: digits:6).
// Ubah konstanta ini bila panjang OTP berubah.
const OTP_LENGTH = 6;

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Konteks dikirim dari Login/Register lewat router state.
    const email = location.state?.email;
    const purpose = location.state?.purpose ?? 'register';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef([]);

    // Tanpa email (akses langsung), kembalikan ke login.
    useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true });
        }
    }, [email, navigate]);

    const focusInput = (index) => {
        inputsRef.current[index]?.focus();
    };

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1); // hanya 1 angka
        setDigits((prev) => {
            const next = [...prev];
            next[index] = digit;
            return next;
        });
        if (digit && index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            focusInput(index - 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const next = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((d, i) => (next[i] = d));
        setDigits(next);
        focusInput(Math.min(pasted.length, OTP_LENGTH - 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = digits.join('');
        if (code.length !== OTP_LENGTH) {
            setError(`Masukkan ${OTP_LENGTH} digit kode OTP.`);
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { data } = await verifyOtpRequest({ email, code, purpose });
            // OTP valid -> simpan token + user, lalu arahkan sesuai role.
            login(data.access_token, data.user);
            navigate(roleHome(data.user.role), { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Verifikasi gagal. Coba lagi.');
            setDigits(Array(OTP_LENGTH).fill(''));
            focusInput(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MobileLayout title="Verifikasi" subtitle={`Kode dikirim ke ${email ?? ''}`}>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <p className="text-sm text-gray-600">
                    Masukkan {OTP_LENGTH} digit kode yang kami kirim ke email Anda. Kode berlaku 5 menit.
                </p>

                {error && (
                    <div role="alert" aria-live="assertive" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputsRef.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={digit}
                            aria-label={`Digit ke-${index + 1}`}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="h-14 w-12 rounded-lg border-gray-300 text-center text-xl font-bold focus:border-primary focus:ring-primary"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                >
                    {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Salah halaman?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Kembali ke Masuk
                    </Link>
                </p>
            </form>
        </MobileLayout>
    );
}
