import api from '../utils/axios';

// Daftar murid yang didampingi pengawas (untuk memilih anak didik).
export const getMyStudents = () => api.get('/guardian/students');

// Ringkasan murid untuk dashboard Ortu/Guru (SummaryController).
// studentId = id user murid yang didampingi.
export const getStudentSummary = (studentId) =>
    api.get(`/guardian/students/${studentId}/summary`);
