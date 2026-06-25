import React from 'react';

/**
 * Kerangka mobile-first bertema feminin: gradasi lembut, ornamen bunga/hati,
 * header bergradien, dan kartu konten semi-transparan (glass).
 *
 * Props: title, subtitle, children, footer
 */
export default function MobileLayout({ title, subtitle, children, footer }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-100 via-pink-50 to-purple-100">
            {/* Blob dekoratif blur di latar */}
            <div className="pointer-events-none fixed -left-20 top-8 h-52 w-52 rounded-full bg-pink-300/30 blur-3xl" />
            <div className="pointer-events-none fixed -right-20 bottom-10 h-60 w-60 rounded-full bg-purple-300/30 blur-3xl" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-white/70 shadow-xl backdrop-blur-sm">
                {title && (
                    <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-primary-400 via-primary to-primary-600 px-6 pb-7 pt-10 text-white shadow-lg">
                        {/* Ornamen bunga & sparkle (aset lokal) */}
                        <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-5 -top-5 w-24 opacity-40" />
                        <img src="/img/blossom.svg" alt="" aria-hidden="true" className="pointer-events-none absolute right-20 -bottom-3 w-12 opacity-25" />
                        <img src="/img/sparkle.svg" alt="" aria-hidden="true" className="pointer-events-none absolute right-6 top-7 w-6 opacity-60" />

                        <div className="relative flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/25">
                                {/* PLACEHOLDER ikon brand */}
                                <img src="/img/heart.svg" alt="" aria-hidden="true" className="w-6" />
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold leading-tight drop-shadow-sm">{title}</h1>
                                {subtitle && <p className="mt-0.5 text-sm text-white/90">{subtitle}</p>}
                            </div>
                        </div>
                    </header>
                )}

                <main className="relative flex-1 px-6 py-6">{children}</main>

                {footer && (
                    <footer className="sticky bottom-0 border-t border-white/60 bg-white/80 px-6 py-4 backdrop-blur-sm">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
}
