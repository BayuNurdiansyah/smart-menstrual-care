import React, { useEffect, useRef, useState } from 'react';

// Web Speech API (gratis, bawaan browser, mendukung bahasa Indonesia).
// Dipakai sebagai FALLBACK selama rekaman suara asli (audioSrc) belum tersedia.
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Pilih suara Bahasa Indonesia bila tersedia. */
function pickIndonesianVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
        voices.find((v) => v.lang === 'id-ID') ||
        voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('id')) ||
        null
    );
}

/**
 * Pecah teks panjang menjadi potongan ~180 karakter per kalimat.
 * Menghindari bug Chrome yang menghentikan TTS setelah ~15 detik.
 */
function chunkText(text, max = 180) {
    const sentences = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/);
    const chunks = [];
    let buf = '';
    for (const s of sentences) {
        if ((buf + ' ' + s).trim().length > max) {
            if (buf) chunks.push(buf.trim());
            buf = s;
        } else {
            buf = (buf + ' ' + s).trim();
        }
    }
    if (buf) chunks.push(buf.trim());
    return chunks;
}

/**
 * @param {string} [audioSrc] URL rekaman suara asli (mis. "/audio/materi/3.mp3").
 *   Jika diberikan dan berhasil dimuat, diputar sebagai <audio> — TTS browser
 *   tidak dipakai. Jika file belum ada (404) atau audioSrc tidak diisi,
 *   otomatis jatuh ke TTS bawaan browser.
 */
export default function SpeakButton({ text, label = 'Dengarkan', audioSrc }) {
    const [speaking, setSpeaking] = useState(false);
    const [audioBroken, setAudioBroken] = useState(false);
    const mounted = useRef(true);
    const audioRef = useRef(null);

    const useRealAudio = Boolean(audioSrc) && !audioBroken;

    // Hangatkan daftar suara TTS (dimuat async oleh browser).
    useEffect(() => {
        if (supported) window.speechSynthesis.getVoices();
        return () => {
            mounted.current = false;
            if (supported) window.speechSynthesis.cancel();
            audioRef.current?.pause();
        };
    }, []);

    useEffect(() => { setAudioBroken(false); }, [audioSrc]);

    if ((!useRealAudio && !supported) || !text?.trim()) return null;

    const stop = () => {
        window.speechSynthesis.cancel();
        audioRef.current?.pause();
        setSpeaking(false);
    };

    const speakWithTts = () => {
        window.speechSynthesis.cancel(); // hentikan materi lain yang sedang dibaca
        const voice = pickIndonesianVoice();
        const chunks = chunkText(text);

        chunks.forEach((chunk, i) => {
            const u = new SpeechSynthesisUtterance(chunk);
            u.lang = 'id-ID';
            if (voice) u.voice = voice;
            u.rate = 0.95;
            u.pitch = 1;
            if (i === chunks.length - 1) {
                u.onend = () => mounted.current && setSpeaking(false);
            }
            u.onerror = () => mounted.current && setSpeaking(false);
            window.speechSynthesis.speak(u);
        });

        setSpeaking(true);
    };

    const speak = () => {
        if (!useRealAudio) {
            speakWithTts();
            return;
        }

        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(() => {
            // File belum ada / gagal diputar -> jatuh ke TTS.
            if (mounted.current) setAudioBroken(true);
            speakWithTts();
        });
        setSpeaking(true);
    };

    return (
        <>
            {audioSrc && (
                <audio
                    ref={audioRef}
                    src={audioSrc}
                    preload="none"
                    onEnded={() => mounted.current && setSpeaking(false)}
                    onError={() => mounted.current && setAudioBroken(true)}
                />
            )}
            <button
                type="button"
                onClick={speaking ? stop : speak}
                aria-label={speaking ? 'Hentikan pembacaan' : 'Bacakan materi ini'}
                className="inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary-50"
            >
                <i className={`fa-solid ${speaking ? 'fa-stop' : 'fa-volume-high'}`} aria-hidden="true" />
                {speaking ? 'Hentikan' : label}
            </button>
        </>
    );
}
