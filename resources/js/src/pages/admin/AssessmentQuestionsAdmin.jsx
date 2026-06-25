import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../../components/MobileLayout';
import {
    listAssessmentQuestions,
    createAssessmentQuestion,
    updateAssessmentQuestion,
    deleteAssessmentQuestion,
} from '../../api/admin';

const blank = { question_text: '', category: '', order: 1, is_active: true };

export default function AssessmentQuestionsAdmin() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(blank);
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');

    const load = () => listAssessmentQuestions().then((r) => setItems(r.data.data ?? [])).catch(() => setError('Gagal memuat.'));
    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (editId) await updateAssessmentQuestion(editId, form);
            else await createAssessmentQuestion(form);
            setForm(blank);
            setEditId(null);
            load();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Gagal menyimpan.');
        }
    };

    const edit = (q) => { setEditId(q.id); setForm({ question_text: q.question_text, category: q.category ?? '', order: q.order, is_active: q.is_active }); };
    const remove = async (id) => { if (window.confirm('Hapus pertanyaan?')) { await deleteAssessmentQuestion(id); load(); } };

    return (
        <MobileLayout title="Kelola Assessment" subtitle="Pertanyaan kemandirian">
            <div className="space-y-4">
                <button onClick={() => navigate('/admin')} className="text-sm font-semibold text-primary hover:underline">&lsaquo; Kembali</button>
                {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

                <form onSubmit={submit} className="space-y-2 rounded-xl border border-gray-100 p-3">
                    <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} placeholder="Teks pertanyaan" required rows={2} className="w-full rounded-lg border-gray-300 px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Kategori" className="flex-1 rounded-lg border-gray-300 px-3 py-2 text-sm" />
                        <input type="number" min="1" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-20 rounded-lg border-gray-300 px-3 py-2 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Aktif
                    </label>
                    <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">{editId ? 'Simpan Perubahan' : 'Tambah Pertanyaan'}</button>
                    {editId && <button type="button" onClick={() => { setEditId(null); setForm(blank); }} className="w-full text-xs text-gray-500">Batal edit</button>}
                </form>

                <ul className="space-y-2">
                    {items.map((q) => (
                        <li key={q.id} className="rounded-lg border border-gray-100 p-3">
                            <p className="text-sm font-semibold text-gray-800">{q.order}. {q.question_text}</p>
                            <p className="text-xs text-gray-500">{q.category} {q.is_active ? '' : '(nonaktif)'}</p>
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
