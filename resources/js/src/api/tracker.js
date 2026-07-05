import api from '../utils/axios';

// ── Siklus menstruasi (murid) ───────────────────────────────────────────────
export const getCurrentCycle = () => api.get('/cycles/current');

export const getCycleHistory = () => api.get('/cycles');

export const startCycle = (payload) => api.post('/cycles', payload);

// Edit/menutup siklus manual (mis. kirim { end_date } untuk menutup).
export const editCycle = (id, payload) => api.put(`/cycles/${id}`, payload);

// ── Assessment harian selama menstruasi (murid) ─────────────────────────────
export const getAssessmentQuestions = () => api.get('/assessments/questions');

// Status harian: tanggal sudah/belum diisi untuk siklus berjalan.
export const getDailyStatus = () => api.get('/assessments/daily-status');

// Seluruh tanggal yang sudah diisi assessment (lintas siklus) -> pewarnaan kalender.
export const getAssessedDates = () => api.get('/assessments/assessed-dates');

// Jawaban tersimpan pada satu tanggal (untuk prefill saat mengedit isian).
export const getAssessmentAnswers = (date) => api.get('/assessments/answers', { params: { date } });

// Simpan assessment satu hari. payload: { date, answers, finished }
// Jika tanggal sudah pernah diisi, jawabannya diperbarui (bukan ditolak).
export const submitDailyAssessment = (payload) => api.post('/assessments', payload);

// Hapus assessment pada satu tanggal.
export const deleteAssessment = (date) => api.delete('/assessments', { data: { date } });

export const getAssessmentChart = () => api.get('/assessments/chart');
