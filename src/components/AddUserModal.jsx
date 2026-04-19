import { useState } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';

export default function AddUserModal({ onClose, onSuccess, setAlert }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'viewer' });
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handlePreSubmit = (e) => {
        e.preventDefault();
        setShowConfirm(true);
    };

    const handleActualSubmit = async () => {
        setLoading(true);
        setShowConfirm(false);
        
        try {
            await api.post('/register-internal', form);
            
            // Notif Sukses Bahasa Indonesia
            setAlert({ 
                show: true, 
                message: `Berhasil! Akun ${form.name} telah didaftarkan.`, 
                type: "simpan" 
            });
            onSuccess(); 

        } catch (err) {
            console.error("DEBUG ERROR:", err.response);
            let errorMessage = "Gagal mendaftarkan pegawai.";

            if (err.response) {
                const data = err.response.data;
                if (data.errors) {
                    const firstError = Object.values(data.errors).flat()[0];
                    // Terjemahan pesan spesifik email ganda
                    if (firstError.toLowerCase().includes('email has already been taken')) {
                        errorMessage = "Email sudah terdaftar. Gunakan email lain.";
                    } else {
                        errorMessage = firstError;
                    }
                } else if (data.message) {
                    errorMessage = data.message;
                }
            } else if (err.request) {
                errorMessage = "Koneksi terputus. Periksa jaringan internet Anda.";
            }

            // Kirim notif error ke parent
            setAlert({ 
                show: true, 
                message: errorMessage, 
                type: "hapus" 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden outline-none font-sans text-left">
            {/* Backdrop Blur Tipis agar Alert di depan terlihat jelas */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity" 
                onClick={!loading ? onClose : null}
            ></div>

            <ConfirmModal 
                show={showConfirm}
                type="simpan"
                message={`Daftarkan ${form.name} sebagai ${form.role.replace('_', ' ')}?`}
                onConfirm={handleActualSubmit}
                onCancel={() => setShowConfirm(false)}
            />

            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Header Style */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800 tracking-tight">Tambah Pegawai Baru</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Registrasi akses pengelola arsip BKAD</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm outline-none"
                    >
                        <i className="bi bi-x-lg text-sm"></i>
                    </button>
                </div>

                <form onSubmit={handlePreSubmit} className="p-8 space-y-5">
                    
                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="Masukkan nama lengkap..."
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all" 
                            onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Instansi</label>
                        <input 
                            required 
                            type="email" 
                            placeholder="contoh@bkad.com"
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all" 
                            onChange={e => setForm({...form, email: e.target.value})} 
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password Sementara</label>
                        <input 
                            required 
                            type="password" 
                            placeholder="Minimal 8 Karakter"
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all" 
                            onChange={e => setForm({...form, password: e.target.value})} 
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 relative text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hak Akses / Role</label>
                        <div className="relative group">
                            <select 
                                value={form.role}
                                required
                                className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3.5 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer appearance-none transition-all"
                                onChange={e => setForm({...form, role: e.target.value})}
                            >
                                <option value="viewer">Viewer (Hanya Lihat)</option>
                                <option value="operator">Operator (Input & OCR SP2D)</option>
                                <option value="super_admin">Super Admin (Akses Penuh)</option>
                            </select>
                            <i className="bi bi-chevron-expand absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors"></i>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-[54px] bg-indigo-600 text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Memproses...' : 'Daftarkan Pegawai'}
                    </button>
                </form>
            </div>
        </div>
    );
}