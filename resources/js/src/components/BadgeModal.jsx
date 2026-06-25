import React from 'react';

/**
 * Modal ucapan selamat saat murid mendapat badge baru.
 * Tampil hanya bila `badge` tidak null.
 */
export default function BadgeModal({ badge, onClose }) {
    if (!badge) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-xs overflow-hidden rounded-3xl bg-white p-6 text-center shadow-2xl">
                {/* Aksen gradien + ornamen */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary-300 to-primary-500" />
                <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="absolute left-4 top-3 w-6 opacity-80" />
                <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="absolute right-6 top-10 w-4 opacity-70" />
                <img src="/img/blossom.svg" alt="" aria-hidden="true" className="absolute -right-4 -top-3 w-16 opacity-40" />

                <div className="relative mx-auto mb-4 mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-white">
                    {/* PLACEHOLDER ikon badge */}
                    <i className={`${badge.icon ?? 'fa-solid fa-medal'} text-3xl text-primary-600`} aria-hidden="true" />
                </div>

                <h3 className="relative text-lg font-extrabold text-gray-800">Selamat!</h3>
                <p className="relative mt-1 text-sm text-gray-600">
                    Kamu mendapatkan Badge:
                    <br />
                    <span className="font-bold text-primary-700">{badge.name}</span>
                </p>

                <button type="button" onClick={onClose} className="btn-primary relative mt-5 w-full">
                    Lanjut
                </button>
            </div>
        </div>
    );
}
