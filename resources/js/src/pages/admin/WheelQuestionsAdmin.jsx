import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import {
    listWheelQuestions,
    createWheelQuestion,
    updateWheelQuestion,
    deleteWheelQuestion,
    uploadWheelAudio,
    deleteWheelAudio,
} from '../../api/admin';

const blank = { stage_id: 1, question: '', option_a: '', option_b: '', option_c: '', answer: 'a', order: 1, is_active: true, audio_path: '' };

export default function WheelQuestionsAdmin() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(blank);
    const [editId, setEditId] = useState(null);
    const [audioPreview, setAudioPreview] = useState({ path: '', url: '' });
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [error, setError] = useState('');

    const load = () => listWheelQuestions().then((r) => setItems(r.data.data ?? [])).catch(() => setError('Gagal memuat.'));
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = { ...form, audio_path: audioPreview.path || '' };
            if (editId) await updateWheelQuestion(editId, payload);
            else await createWheelQuestion(payload);
            setForm(blank);
            setEditId(null);
            setAudioPreview({ path: '', url: '' });
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menyimpan.');
        }
    };

    const edit = (q) => {
        setEditId(q.id);
        setForm({
            stage_id: q.stage_id,
            question: q.question,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            answer: q.answer ?? 'a',
            order: q.order,
            is_active: q.is_active,
            audio_path: q.audio_path ?? '',
        });
        setAudioPreview({ path: q.audio_path ?? '', url: q.audio_url ?? '' });
    };

    const remove = async (id) => {
        if (!window.confirm('Hapus soal ini?')) return;
        await deleteWheelQuestion(id);
        load();
    };

    const handleAudioFile = async (file) => {
        if (!file) return;
        setUploadingAudio(true);
        try {
            const res = await uploadWheelAudio(file);
            setAudioPreview({ path: res.data.path, url: res.data.url });
        } catch {
            setError('Gagal mengunggah audio.');
        } finally {
            setUploadingAudio(false);
        }
    };

    const removeAudio = async () => {
        if (!audioPreview.path) return;
        try {
            await deleteWheelAudio(audioPreview.path);
        } catch {
            // file mungkin sudah tidak ada, tetap bersihkan state
        }
        setAudioPreview({ path: '', url: '' });
    };

    const cancelEdit = () => { setEditId(null); setForm(blank); setAudioPreview({ path: '', url: '' }); };

    const inp = 'w-full rounded-lg border-gray-300 px-3 py-2 text-sm';

    return (
        <MobileLayout title="Kelola Roda" subtitle="Soal Roda Keberuntungan">
            <div className="space-y-4">
                <button onClick={() => navigate('/admin')} className="text-sm font-semibold text-primary hover:underline">&lsaquo; Kembali</button>
                {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <form onSubmit={submit} className="space-y-2 rounded-xl border border-gray-100 p-3">
                    <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Pertanyaan" required rows={2} className={inp} />
                    <input value={form.option_a} onChange={(e) => setForm({ ...form, option_a: e.target.value })} placeholder="Opsi A" required className={inp} />
                    <input value={form.option_b} onChange={(e) => setForm({ ...form, option_b: e.target.value })} placeholder="Opsi B" required className={inp} />
                    <input value={form.option_c} onChange={(e) => setForm({ ...form, option_c: e.target.value })} placeholder="Opsi C" required className={inp} />
                    <div className="flex gap-2">
                        <select value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="flex-1 rounded-lg border-gray-300 px-3 py-2 text-sm">
                            <option value="a">Jawaban: A</option>
                            <option value="b">Jawaban: B</option>
                            <option value="c">Jawaban: C</option>
                        </select>
                        <input type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-20 rounded-lg border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Aktif
                    </label>

                    {/* Audio narasi soal */}
                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                        <p className="mb-1 text-xs font-semibold text-gray-600">Audio Soal <span className="font-normal text-gray-400">(opsional — diputar saat soal muncul)</span></p>
                        {audioPreview.url && (
                            <div className="mb-2 flex items-center gap-2">
                                <audio controls src={audioPreview.url} className="h-8 flex-1" />
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
                        {uploadingAudio && <p className="mt-1 text-xs text-gray-400">Mengunggah audio...</p>}
                    </div>

                    <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{editId ? 'Simpan Perubahan' : 'Tambah Soal'}</button>
                    {editId && <button type="button" onClick={cancelEdit} className="w-full text-xs text-gray-500">Batal edit</button>}
                </form>

                <ul className="space-y-2">
                    {items.map((q) => (
                        <li key={q.id} className="rounded-lg border border-gray-100 p-3">
                            <p className="text-sm font-semibold text-gray-800">{q.order}. {q.question}</p>
                            <p className="text-xs text-gray-500">Jawaban: {(q.answer ?? '-').toUpperCase()} {q.is_active ? '' : '(nonaktif)'}</p>
                            {q.audio_url && (
                                <audio controls src={q.audio_url} className="mt-1 h-8 w-full" />
                            )}
                            <div className="mt-2 flex gap-2">
                                <button onClick={() => edit(q)} className="rounded border border-gray-200 px-3 py-1 text-xs">Ubah</button>
                                <button onClick={() => remove(q.id)} className="rounded border border-red-200 px-3 py-1 text-xs text-red-600">Hapus</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </MobileLayout>
    );
}
