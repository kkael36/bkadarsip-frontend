import { useNavigate } from 'react-router-dom';
import DaftarSp2d from '../components/DaftarSp2d';
import { useAuth } from '../context/AuthContext';

export default function DaftarArsip() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500 mt-6">
            
            {/* HEADER AREA - STYLE KONSISTEN BENTUK PILL */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Manajemen Arsip SP2D</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Kelola dan monitoring dokumen SP2D yang telah diunggah ke dalam sistem</p>
                </div>
                
                {/* 🔥 Tombol hanya muncul jika role super_admin atau operator */}
                {(user?.role === 'super_admin' || user?.role === 'operator') && (
                    <button 
                        onClick={() => navigate('/upload')}
                        className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        + Input Dokumen
                    </button>
                )}
            </div>

            {/* TABLE AREA */}
            <div className="animate-in fade-in duration-700 delay-200">
                <DaftarSp2d user={user} />
            </div>
            
        </div>
    );
}