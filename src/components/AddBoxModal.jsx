import { useState } from 'react';
import api from '../services/api';

export default function AddBoxModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        nomor_box: '',
        kode_klasifikasi: '',
        tahun: '',
        rak_posisi: '',
        keterangan: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/boxes', formData);
            onSuccess();
        } catch (err) {
            alert("Gagal menambahkan box. Pastikan No. Box belum ada.");
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Registrasi Box Baru</h2>
                    <button onClick={onClose}><i className="bi bi-x-lg text-slate-400"></i></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">No. Box</label>
                            <input 
                                type="text" placeholder="FA-947" required
                                className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none focus:ring-1 focus:ring-indigo-100 outline-none"
                                onChange={e => setFormData({...formData, nomor_box: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Klasifikasi</label>
                            <input 
                                type="text" placeholder="Keuangan"
                                className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none focus:ring-1 focus:ring-indigo-100 outline-none"
                                onChange={e => setFormData({...formData, kode_klasifikasi: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun (Opsional)</label>
                            <input 
                                type="number" placeholder="2024"
                                className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none focus:ring-1 focus:ring-indigo-100 outline-none"
                                onChange={e => setFormData({...formData, tahun: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi Rak</label>
                            <input 
                                type="text" placeholder="Rak A-1" required
                                className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none focus:ring-1 focus:ring-indigo-100 outline-none"
                                onChange={e => setFormData({...formData, rak_posisi: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Keterangan</label>
                        <textarea 
                            className="w-full p-3 bg-slate-50 rounded-2xl text-sm border-none focus:ring-1 focus:ring-indigo-100 outline-none h-20 resize-none"
                            onChange={e => setFormData({...formData, keterangan: e.target.value})}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-4"
                    >
                        Simpan Data Box
                    </button>
                </form>
            </div>
        </div>
    );
}