import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Deteksi URL langsung dari browser
    const location = useLocation();

    // Map URL Path ke Judul Header
    const getPageTitle = (path) => {
        if (path.startsWith('/dashboard')) return 'Dashboard';
        if (path.startsWith('/arsip')) return 'Daftar Arsip SP2D';
        if (path.startsWith('/upload')) return 'Input Dokumen SP2D';
        if (path.startsWith('/edit-arsip')) return 'Edit Dokumen SP2D';
        if (path.startsWith('/users')) return 'Kelola Pegawai';
        if (path.startsWith('/boxes')) return 'Manajemen Rak & Box';
        if (path.startsWith('/denah')) return 'Denah Arsip Utama';
        if (path.startsWith('/add-box')) return 'Tambah Box Baru';
        if (path.startsWith('/edit-box')) return 'Edit Data Box';
        if (path.startsWith('/profile')) return 'Pengaturan Profil';
        return 'Sistem Arsip BKAD'; // Default
    };

    const currentTitle = getPageTitle(location.pathname);

    const maskEmail = (email) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        return `${name.substring(0, 1)}****@${domain}`;
    };

    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

    return (
        <div className="flex h-screen bg-white font-sans antialiased text-slate-900 overflow-hidden relative">

            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* HEADER */}
                <header className="h-20 flex items-center justify-between px-10 relative z-50 bg-white border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                            {currentTitle.toUpperCase()}
                        </h2>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            {today}
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className='group flex items-center gap-3 cursor-pointer' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <span className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wide">
                                    {user?.name?.split(' ')[0]}
                                </span>

                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center pl-0.5 pr-0.5 py-0.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer group outline-none focus:ring-2 focus:ring-slate-200"
                                >
                                    
                                    <div className="w-9 h-9 bg-blue-700 rounded-xl flex items-center justify-center text-white text-[11px] font-black overflow-hidden shadow-sm shadow-blue-100 border border-slate-200">
                                        {/* FIX CLOUDINARY: Menggunakan URL langsung */}
                                        {user?.photo_profile ? (
                                            <img
                                                src={user.photo_profile}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* DROPDOWN PROFILE */}
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-md z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 flex items-start gap-3 border-b border-slate-100 mb-1">
                                            <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white text-xs font-black overflow-hidden flex-shrink-0">
                                                {/* FIX CLOUDINARY: Menggunakan URL langsung */}
                                                {user?.photo_profile ? (
                                                    <img src={user.photo_profile} alt="P" className="w-full h-full object-cover" />
                                                ) : (
                                                    user?.name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tighter">{user?.name}</p>
                                                <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5 lowercase">{maskEmail(user?.email)}</p>
                                                <div className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md">
                                                    {user?.role?.replace('_', ' ')}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="px-1.5 space-y-0.5">
                                            <button
                                                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-700 transition-colors text-[11px] font-bold text-left"
                                            >
                                                <i className="bi bi-gear-wide-connected text-sm opacity-60"></i>
                                                Pengaturan Profil
                                            </button>
                                            <button
                                                onClick={() => { setShowLogoutConfirm(true); setIsMenuOpen(false); }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-[11px] font-bold text-left"
                                            >
                                                <i className="bi bi-power text-sm opacity-60"></i>
                                                Keluar Aplikasi
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main id="area-scroll-utama" className="flex-1 overflow-y-auto px-4 md:px-10 pb-10 custom-scrollbar relative scroll-smooth">
                    {children}

                    <footer className="pt-2 text-center mt-10">
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                            BKAD KOTA BOGOR — ARSIP DIGITAL &copy; 2026
                        </p>
                    </footer>
                </main>
            </div>

            {/* SIMPLE LOGOUT MODAL */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
                        <h3 className="text-base font-bold text-slate-800 mb-2">Konfirmasi Keluar</h3>
                        <p className="text-sm text-slate-500 mb-6">Apakah Anda yakin ingin mengakhiri sesi ini?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}