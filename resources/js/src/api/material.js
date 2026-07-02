import api from '../utils/axios';

// ── Admin (CRUD) ────────────────────────────────────────────────────────────
export const listMaterials = (stageId) =>
    api.get('/admin/materials', { params: { stage_id: stageId } });

export const getMaterial = (id) => api.get(`/admin/materials/${id}`);

export const createMaterial = (payload) => api.post('/admin/materials', payload);

export const updateMaterial = (id, payload) => api.put(`/admin/materials/${id}`, payload);

export const deleteMaterial = (id) => api.delete(`/admin/materials/${id}`);

// Upload gambar (ilustrasi langkah / galeri) -> { path, url }
export const uploadImage = (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/admin/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// Upload audio narasi materi -> { path, url }
export const uploadAudio = (file) => {
    const fd = new FormData();
    fd.append('audio', file);
    return api.post('/admin/uploads-audio', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ── Murid (read-only per tahap) ─────────────────────────────────────────────
export const getStageMaterials = (stageId) => api.get(`/stages/${stageId}/materials`);
