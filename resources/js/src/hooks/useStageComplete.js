import { useState } from 'react';
import { completeStage } from '../api/game';

/**
 * Tandai tahap selesai lalu tampung badge baru (jika ada) untuk modal.
 * Dipakai game tanpa skor (mis. Roda Keberuntungan) maupun lewat useGameFinish.
 */
export default function useStageComplete(stageId) {
    const [badge, setBadge] = useState(null);

    const complete = async () => {
        try {
            const res = await completeStage(stageId);
            const badges = res.data?.badges ?? [];
            if (badges.length > 0) setBadge(badges[0]);
        } catch {
            // diamkan; penyelesaian opsional tidak memblok permainan
        }
    };

    return { complete, badge, clearBadge: () => setBadge(null) };
}
