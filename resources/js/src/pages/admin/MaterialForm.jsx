import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import { createMaterial, getMaterial, updateMaterial, uploadImage, uploadAudio } from '../../api/material';
import { STAGES } from '../../utils/stages';

const inputClass =
    'w-full rounded-lg border-gray-300 px-4 py-3 text-base focus:border-primary focus:ring-primary';

export default function MaterialForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        stage_id: STAGES[0].id,
        title: '',
        text_content: '',
        youtube_url: '',
        order: 1,
        is_published: true,
    });
    const [steps, setSteps] = useState([]); // [{ text, image_path, image_url }]
    const [images, setImages] = useState([]); // [{ image_path, image_url, caption }]
    const [audio, setAudio] = useState({ path: '', url: '' }); // narasi materi (opsional)
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [uploadingAudio, setUploadingAudio] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        getMaterial(id)
            .then((res) => {
                const m = res.data.data ?? res.data;
                setForm({
                    stage_id: m.stage_id,
                    title: m.title ?? '',
                    text_content: m.text_content ?? '',
                    youtube_url: m.youtube_video_id ?? '',
                    order: m.order ?? 1,
                    is_published: Boolean(m.is_published),
                });
                setSteps((m.steps ?? []).map((s) => ({ text: s.text ?? '', image_path: s.image_path ?? '', image_url: s.image_url ?? '' })));
                setImages((m.images ?? []).map((img) => ({ image_path: img.image_path ?? '', image_url: img.image_url ?? '', caption: img.caption ?? '' })));
                setAudio({ path: m.audio_path ?? '', url: m.audio_url ?? '' });
            })
            .catch((err) => setMessage(err.response?.data?.message ?? 'Gagal memuat materi.'))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const fieldError = (name) => errors[name]?.[0];

    // ── Langkah ──────────────────────────────────────────────────────────────
    const addStep = () => setSteps((s) => [...s, { text: '', image_path: '', image_url: '' }]);
    const removeStep = (i) => setSteps((s) => s.filter((_, idx) => idx !== i));
    const changeStepText = (i, text) => setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, text } : st)));
    const uploadStepImage = async (i, file) => {
        if (!file) return;
        try {
            const res = await uploadImage(file);
            setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, image_path: res.data.path, image_url: res.data.url } : st)));
        } catch {
            setMessage('Gagal mengunggah gambar langkah.');
        }
    };

    // ── Galeri gambar ─────────────────────────────────────────────────────────
    const addImageFromFile = async (file) => {
        if (!file) return;
        try {
            const res = await uploadImage(file);
            setImages((g) => [...g, { image_path: res.data.path, image_url: res.data.url, caption: '' }]);
        } catch {
            setMessage('Gagal mengunggah gambar.');
        }
    };
    const removeImage = (i) => setImages((g) => g.filter((_, idx) => idx !== i));
    const changeCaption = (i, caption) => setImages((g) => g.map((im, idx) => (idx === i ? { ...im, caption } : im)));

    // ── Audio narasi ─────────────────────────────────────────────────────────
    const handleAudioFile = async (file) => {
        if (!file) return;
        setUploadingAudio(true);
        try {
            const res = await uploadAudio(file);
            setAudio({ path: res.data.path, url: res.data.url });
        } catch {
            setMessage('Gagal mengunggah audio.');
        } finally {
            setUploadingAudio(false);
        }
    };
    const removeAudio = () => setAudio({ path: '', url: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage('');
        setSaving(true);

        const payload = {
            stage_id: Number(form.stage_id),
            title: form.title,
            text_content: form.text_content,
            youtube_url: form.youtube_url,
            audio_path: audio.path || '',
            order: Number(form.order),
            is_published: form.is_published,
            steps: steps.map((s, i) => ({ text: s.text, image_path: s.image_path || null, order: i + 1 })),
            images: images
                .filter((im) => im.image_path)
                .map((im, i) => ({ image_path: im.image_path, caption: im.caption || null, order: i + 1 })),
        };

        try {
            if (isEdit) await updateMaterial(id, payload);
            else await createMaterial(payload);
            navigate('/admin', { replace: true });
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
            setMessage(err.response?.data?.message ?? 'Gagal menyimpan materi.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MobileLayout title="Materi">
                <p className="text-gray-500">Memuat...</p>
            </MobileLayout>
        );
    }

    return (
        <MobileLayout title={isEdit ? 'Ubah Materi' : 'Tambah Materi'} subtitle="Admin Panel">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {message && <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}

                <div>
                    <label htmlFor="stage_id" className="mb-1 block text-sm font-semibold text-gray-700">Tahap</label>
                    <select id="stage_id" name="stage_id" value={form.stage_id} onChange={handleChange} className={inputClass}>
                        {STAGES.map((s) => (<option key={s.id} value={s.id}>{s.id}. {s.title}</option>))}
                    </select>
                </div>

                <div>
                    <label htmlFor="title" className="mb-1 block text-sm font-semibold text-gray-700">Judul</label>
                    <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} className={inputClass} />
                    {fieldError('title') && <p className="mt-1 text-xs text-red-600">{fieldError('title')}</p>}
                </div>

                <div>
                    <label htmlFor="text_content" className="mb-1 block text-sm font-semibold text-gray-700">
                        Isi Teks <span className="font-normal text-gray-400">(kosongkan bila langsung video)</span>
                    </label>
                    <textarea id="text_content" name="text_content" rows={5} value={form.text_content} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                    <label htmlFor="youtube_url" className="mb-1 block text-sm font-semibold text-gray-700">URL YouTube <span className="font-normal text-gray-400">(opsional)</span></label>
                    <input id="youtube_url" name="youtube_url" type="text" value={form.youtube_url} onChange={handleChange} className={inputClass} placeholder="https://youtu.be/xxxxxxxxxxx" />
                </div>

                {/* Audio narasi */}
                <div className="rounded-xl border border-gray-100 p-3">
                    <h3 className="mb-2 text-sm font-bold text-gray-700">
                        Audio Narasi <span className="font-normal text-gray-400">(opsional — jika kosong, dibacakan otomatis oleh suara robot)</span>
                    </h3>
                    {audio.url && (
                        <div className="mb-2 flex items-center gap-2">
                            <audio controls src={audio.url} className="h-9 flex-1" />
                            <button type="button" onClick={removeAudio} className="text-xs text-red-600">Hapus</button>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="audio/*"
                        disabled={uploadingAudio}
                        onChange={(e) => handleAudioFile(e.target.files?.[0])}
                        className="text-xs"
                    />
                    {uploadingAudio && <p className="mt-1 text-xs text-gray-400">Mengunggah...</p>}
                </div>

                {/* Langkah berilustrasi */}
                <div className="rounded-xl border border-gray-100 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700">Langkah-langkah (opsional)</h3>
                        <button type="button" onClick={addStep} className="rounded-lg bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">+ Langkah</button>
                    </div>
                    <div className="space-y-3">
                        {steps.map((s, i) => (
                            <div key={i} className="rounded-lg border border-gray-100 p-2">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-gray-500">Langkah {i + 1}</span>
                                    <button type="button" onClick={() => removeStep(i)} className="text-xs text-red-600">Hapus</button>
                                </div>
                                <textarea rows={2} value={s.text} onChange={(e) => changeStepText(i, e.target.value)} className={inputClass} placeholder="Penjelasan langkah" />
                                <div className="mt-2 flex items-center gap-2">
                                    {s.image_url && <img src={s.image_url} alt="" className="h-12 w-12 rounded object-cover" />}
                                    <input type="file" accept="image/*" onChange={(e) => uploadStepImage(i, e.target.files?.[0])} className="text-xs" />
                                </div>
                            </div>
                        ))}
                        {steps.length === 0 && <p className="text-xs text-gray-400">Belum ada langkah.</p>}
                    </div>
                </div>

                {/* Galeri gambar */}
                <div className="rounded-xl border border-gray-100 p-3">
                    <h3 className="mb-2 text-sm font-bold text-gray-700">Galeri Gambar (opsional)</h3>
                    <input type="file" accept="image/*" onChange={(e) => addImageFromFile(e.target.files?.[0])} className="text-xs" />
                    <div className="mt-3 space-y-2">
                        {images.map((im, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-100 p-2">
                                {im.image_url && <img src={im.image_url} alt="" className="h-12 w-12 rounded object-cover" />}
                                <input type="text" value={im.caption} onChange={(e) => changeCaption(i, e.target.value)} placeholder="Keterangan" className="flex-1 rounded border-gray-300 px-2 py-1 text-xs" />
                                <button type="button" onClick={() => removeImage(i)} className="text-xs text-red-600">Hapus</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="w-24">
                        <label htmlFor="order" className="mb-1 block text-sm font-semibold text-gray-700">Urutan</label>
                        <input id="order" name="order" type="number" min="1" value={form.order} onChange={handleChange} className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-gray-700">
                        <input name="is_published" type="checkbox" checked={form.is_published} onChange={handleChange} className="rounded border-gray-300 text-primary focus:ring-primary" />
                        Publikasikan
                    </label>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => navigate('/admin')} className="flex-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                    <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                </div>
            </form>
        </MobileLayout>
    );
}
