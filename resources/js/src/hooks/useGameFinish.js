import { useState } from 'react';
import { submitScore, completeStage } from '../api/game';

/**
 * Alur akhir mini game berskor:
 *  1) kirim skor/waktu (submitScore)
 *  2) tandai tahap selesai (completeStage) -> backend evaluasi badge
 *  3) jika ada badge BARU, simpan untuk ditampilkan via modal
 */
export default function useGameFinish(stageId) {
    const [badge, setBadge] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const finish = async (gameType, value) => {
        setSubmitting(true);
        try {
            await submitScore(gameType, value);
            const res = await completeStage(stageId);
            const badges = res.data?.badges ?? [];
            if (badges.length > 0) setBadge(badges[0]);
        } catch {
            // Sinkronisasi gagal tidak membatalkan kemenangan pemain.
        } finally {
            setSubmitting(false);
        }
    };

    return { finish, badge, clearBadge: () => setBadge(null), submitting };
}
