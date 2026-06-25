import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutRequest } from '../../api/auth';
import { getBadges } from '../../api/game';

// Menu 4 tahap (judul Inggris + sub Indonesia), id selaras StageSeeder.
const MENU = [
    { id: 1, en: 'Know Your Body!', sub: 'Kenali Tubuhmu!', icon: 'fa-solid fa-child-reaching' },
    { id: 2, en: 'Understand Care', sub: 'Pahami & Peduli', icon: 'fa-solid fa-hand-holding-heart' },
    { id: 3, en: 'Practice Smart Care', sub: 'Praktikkan Perawatan Cerdas', icon: 'fa-solid fa-droplet' },
    { id: 4, en: 'Healthy Habit Builder', sub: 'Membangun Kebiasaan Sehat', icon: 'fa-solid fa-heart-circle-check' },
];

const QUOTE =
    'Merawat tubuhku di masa menstruasi adalah cara aku mencintai dan menghargai diriku sendiri.';

export default function MuridDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        getBadges()
            .then((res) => setBadges(res.data.data ?? []))
            .catch(() => setBadges([]));
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

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-100 via-pink-50 to-purple-100">
            {/* Blob dekoratif */}
            <div className="pointer-events-none fixed -left-20 top-24 h-52 w-52 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="pointer-events-none fixed -right-20 bottom-16 h-60 w-60 rounded-full bg-purple-300/30 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white/60 shadow-xl backdrop-blur-sm">
                {/* Header: logo + navigasi */}
                <header className="relative flex items-center justify-between overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary-400 via-primary to-primary-600 px-5 py-4 text-white shadow-lg">
                    <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="pointer-events-none absolute right-28 top-2 w-5 opacity-60" />
                    <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-4 -bottom-4 w-16 opacity-30" />
                    <div className="relative flex items-center gap-2 rounded-2xl bg-white/95 px-3 py-1.5 text-primary shadow-sm">
                        <img src="/img/heart.svg" alt="" aria-hidden="true" className="w-5" />
                        <span className="text-sm font-extrabold leading-tight">Menstrual<br />Care</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/murid')}
                            className="flex flex-col items-center rounded-xl bg-white/15 px-3 py-1 text-[11px] font-semibold"
                        >
                            {/* PLACEHOLDER: <i className="fa-solid fa-house" /> */}
                            <i className="fa-solid fa-house text-base" aria-hidden="true" />
                            Home
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/murid/akun')}
                            className="flex flex-col items-center rounded-xl bg-white/15 px-3 py-1 text-[11px] font-semibold"
                        >
                            {/* PLACEHOLDER: <i className="fa-solid fa-user" /> */}
                            <i className="fa-solid fa-user text-base" aria-hidden="true" />
                            Akun
                        </button>
                    </div>
                </header>

                {/* Sapaan + ilustrasi */}
                <section className="flex items-start justify-between gap-3 px-5 pt-5">
                    <div>
                        <h1 className="text-xl font-extrabold text-primary-700">
                            Hai {user?.name ?? 'Murid'}!
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Selamat datang di
                            <br />
                            Menstrual Care
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/murid/stage/1')}
                            className="mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow"
                        >
                            Yuk, mulai belajar!
                        </button>
                    </div>
                    {/* Ilustrasi bunga (aset lokal) */}
                    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/80 to-pink-100 shadow-inner">
                        <img src="/img/blossom.svg" alt="" aria-hidden="true" className="w-16 drop-shadow" />
                        <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="absolute -right-1 top-1 w-5" />
                    </div>
                </section>

                {/* Menu tahap */}
                <section className="space-y-3 px-5 pt-5">
                    {MENU.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => navigate(`/murid/stage/${m.id}`)}
                            className="flex w-full items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-left shadow-sm ring-1 ring-primary-100 transition hover:bg-white"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-300 to-primary-500 text-white shadow-sm">
                                {/* PLACEHOLDER ikon FA */}
                                <i className={m.icon} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block font-bold text-primary-700">{m.en}</span>
                                <span className="block text-xs text-gray-500">({m.sub})</span>
                            </span>
                            <span aria-hidden="true" className="text-primary-300">
                                <i className="fa-solid fa-chevron-right" />
                            </span>
                        </button>
                    ))}
                </section>

                {/* Kuotes */}
                <section className="px-5 pt-6">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100/80 to-purple-100/80 px-5 py-4 text-center shadow-sm">
                        <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -left-3 -top-3 w-12 opacity-30" />
                        <p className="relative text-sm font-medium italic text-primary-800">&ldquo;{QUOTE}&rdquo;</p>
                    </div>
                </section>

                {/* Badge yang diraih */}
                <section className="px-5 pb-6 pt-6">
                    <h2 className="mb-3 text-base font-bold text-gray-800">Badge yang Diraih</h2>
                    {badges.length === 0 ? (
                        <p className="rounded-xl bg-white/70 px-4 py-4 text-center text-sm text-gray-500">
                            Belum ada badge. Selesaikan tahap untuk mengumpulkannya!
                        </p>
                    ) : (
                        <ul className="grid grid-cols-2 gap-3">
                            {badges.map((b) => (
                                <li
                                    key={b.id}
                                    className="flex items-center gap-2 rounded-xl bg-white/80 p-3 shadow-sm ring-1 ring-primary-100"
                                >
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                        {/* PLACEHOLDER ikon badge */}
                                        <i className={b.icon ?? 'fa-solid fa-medal'} aria-hidden="true" />
                                    </span>
                                    <span className="text-xs font-semibold text-gray-800">{b.name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <div className="mt-auto px-5 pb-6">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full rounded-lg border border-gray-200 bg-white/70 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-white"
                    >
                        {/* PLACEHOLDER: <i className="fa-solid fa-right-from-bracket" /> */}
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    );
}
