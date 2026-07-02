import React, { useState } from 'react';
import useStageComplete from '../hooks/useStageComplete';
import BadgeModal from './BadgeModal';

/**
 * Tombol "Tandai Selesai Belajar" untuk tahap tanpa mini game (Tahap 3).
 * Menandai tahap selesai -> backend award badge.
 */
export default function FinishLearningButton({ stageId }) {
    const { complete, badge, clearBadge } = useStageComplete(stageId);
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);

    const handle = async () => {
        setBusy(true);
        await complete();
        setDone(true);
        setBusy(false);
    };

    return (
        <div className="card-soft p-5 text-center">
            {done ? (
                <p className="font-semibold text-green-700">
                    <i className="fa-solid fa-circle-check mr-2" aria-hidden="true" />
                    Tahap ini sudah kamu selesaikan.
                </p>
            ) : (
                <>
                    <p className="mb-3 text-sm text-gray-600">
                        Sudah selesai membaca semua materi tahap ini? Tandai selesai untuk
                        mengumpulkan badge.
                    </p>
                    <button type="button" onClick={handle} disabled={busy} className="btn-primary w-full">
                        {busy ? 'Memproses...' : 'Tandai Selesai Belajar'}
                    </button>
                </>
            )}
            <BadgeModal badge={badge} onClose={clearBadge} />
        </div>
    );
}
