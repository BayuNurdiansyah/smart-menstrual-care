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

// Upload audio untuk soal roda (pakai endpoint yang sama dengan material audio)
export const uploadWheelAudio = (file) => {
    const fd = new FormData();
    fd.append('audio', file);
    return api.post('/admin/uploads-audio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const deleteWheelAudio = (path) => api.delete('/admin/uploads-audio', { data: { path } });

// ── Relasi Murid <-> Pengawas ───────────────────────────────────────────────
export const listGuardianLinks = () => api.get('/admin/guardian-links');
export const attachGuardian = (studentId, guardianId) =>
    api.post(`/admin/students/${studentId}/guardians`, { guardian_id: guardianId });
export const detachGuardian = (studentId, guardianId) =>
    api.delete(`/admin/students/${studentId}/guardians/${guardianId}`);
