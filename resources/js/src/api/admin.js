import api from '../utils/axios';

// ── Pertanyaan Assessment ───────────────────────────────────────────────────
export const listAssessmentQuestions = () => api.get('/admin/assessment-questions');
export const createAssessmentQuestion = (p) => api.post('/admin/assessment-questions', p);
export const updateAssessmentQuestion = (id, p) => api.put(`/admin/assessment-questions/${id}`, p);
export const deleteAssessmentQuestion = (id) => api.delete(`/admin/assessment-questions/${id}`);

// ── Soal Roda Keberuntungan ─────────────────────────────────────────────────
export const listWheelQuestions = () => api.get('/admin/wheel-questions');
export const createWheelQuestion = (p) => api.post('/admin/wheel-questions', p);
export const updateWheelQuestion = (id, p) => api.put(`/admin/wheel-questions/${id}`, p);
export const deleteWheelQuestion = (id) => api.delete(`/admin/wheel-questions/${id}`);

// ── Relasi Murid <-> Pengawas ───────────────────────────────────────────────
export const listGuardianLinks = () => api.get('/admin/guardian-links');
export const attachGuardian = (studentId, guardianId) =>
    api.post(`/admin/students/${studentId}/guardians`, { guardian_id: guardianId });
export const detachGuardian = (studentId, guardianId) =>
    api.delete(`/admin/students/${studentId}/guardians/${guardianId}`);
