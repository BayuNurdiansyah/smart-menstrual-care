import api from '../utils/axios';

/**
 * Kirim hasil mini game. Gameplay murni di local state React;
 * hanya skor/waktu terbaik yang dikirim ke server.
 *
 *  - gameType: 'memory_card'
 *  - value:    skor (makin tinggi makin baik)
 */
export const submitScore = (gameType, value) =>
    api.post('/games/score', { game_type: gameType, value });

/** Badge yang sudah dikumpulkan murid (untuk dashboard). */
export const getBadges = () => api.get('/games/badges');

/** Soal Roda Keberuntungan untuk sebuah tahap (KYB). */
export const getWheelQuestions = (stageId) => api.get(`/stages/${stageId}/wheel-questions`);

/**
 * Tandai tahap selesai (dipanggil setelah submitScore sukses).
 * Response: { message, badges: [{ id, slug, name, icon }] } -> badges = badge BARU.
 */
export const completeStage = (stageId) => api.post(`/stages/${stageId}/complete`);
