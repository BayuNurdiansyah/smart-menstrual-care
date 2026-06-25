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

// Simpan assessment satu hari. payload: { date, answers, finished }
export const submitDailyAssessment = (payload) => api.post('/assessments', payload);

export const getAssessmentChart = () => api.get('/assessments/chart');
