import { useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoArsip from '../assets/logoarsipv2.png';

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); 

    const menuGroups = [
        {
            title: 'MANAJEMEN SP2D',
            roles: ['super_admin', 'operator', 'viewer'], // 🔥 Ubah user jadi viewer
            items: [
                { id: 'upload', label: 'Input Dokumen', icon: 'bi-pencil-square', path: '/upload', roles: ['super_admin', 'operator'] },
                { id: 'arsip', label: 'Daftar Arsip', icon: 'bi-collection', path: '/arsip', roles: ['super_admin', 'operator', 'viewer'] }, // 🔥 Ubah user jadi viewer
            ]
        },
        {
            title: 'MANAJEMEN BOX',
            roles: ['super_admin', 'operator', 'viewer'], // 🔥 Ubah user jadi viewer
            items: [
                { id: 'add_box', label: 'Tambah Box', icon: 'bi-plus-square', path: '/add-box', roles: ['super_admin', 'operator'] },
                { id: 'box', label: 'Daftar Box', icon: 'bi-box', path: '/boxes', roles: ['super_admin', 'operator', 'viewer'] },
                { id: 'denah', label: 'Denah Arsip', icon: 'bi-map', path: '/denah', roles: ['super_admin', 'operator', 'viewer'] }, // 🔥 Ubah user jadi viewer
            ]
        },
        {
            title: 'SISTEM',
            roles: ['super_admin'],
            items: [
                { id: 'users', label: 'Pegawai', icon: 'bi-people', path: '/users', roles: ['super_admin'] },
            ]
        }
    ];

    // Inisialisasi state LANGSUNG berdasarkan URL saat ini
    const [openMenus, setOpenMenus] = useState(() => {
        const initialState = {};
        menuGroups.forEach(group => {
            // Cek apakah ada item di dalam grup ini yang cocok dengan URL sekarang
            const isActive = group.items.some(item => location.pathname.startsWith(item.path));
            if (isActive) {
                initialState[group.title] = true;
            }
        });
        return initialState;
    });
    
    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    return (
        <div className="w-64 h-screen bg-slate-800 flex flex-col p-6 sticky top-0 transition-all duration-300">
            <div className="px-2 py-8 flex items-center gap-4 mb-2">
                <div className="w-14 h-14 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <img src={logoArsip} alt="Logo BKAD" className="h-10 w-auto object-contain brightness-0 invert" />
                </div>
                <div className="h-8 w-[1px] bg-slate-700"></div>
                <div className="flex flex-col">
                    <span className="text-xl font-black text-white tracking-tighter leading-none uppercase">BKAD</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Arsip Digital</span>
                </div>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto pt-4 no-scrollbar">
                <div className="mb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm transition-all duration-200 ${
                            location.pathname.startsWith('/dashboard') 
                            ? 'bg-blue-600/10 text-blue-400 font-bold' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium'
                        }`}
                    >
                        <i className={`bi bi-grid ${location.pathname.startsWith('/dashboard') ? 'text-blue-400' : 'text-slate-500'} text-lg`}></i>
                        Dashboard
                    </button>
                </div>

                {menuGroups.filter(group => group.roles.includes(user?.role)).map((group, idx) => {
                    const isOpen = openMenus[group.title];

                    return (
                        <div key={idx} className="mb-4">
                            <button 
                                onClick={() => toggleMenu(group.title)}
                                className="w-full flex items-center justify-between px-2 py-2 mb-2 group outline-none"
                            >
                                <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-300 uppercase tracking-widest transition-colors">
                                    {group.title}
                                </span>
                                <div className="w-6 h-6 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700 group-hover:border-slate-500 transition-colors">
                                    <i className={`bi bi-chevron-right text-[10px] text-slate-400 group-hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}></i>
                                </div>
                            </button>
                            
                            <div className={`space-y-1 ml-2 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                {group.items.filter(item => item.roles.includes(user?.role)).map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => navigate(item.path)}
                                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                                                isActive 
                                                ? 'bg-blue-600/10 text-blue-400 font-bold' 
                                                : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200 font-medium'
                                            }`}
                                        >
                                            <i className={`bi ${item.icon} ${isActive ? 'text-blue-400' : 'text-slate-500'} text-lg`}></i>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>
        </div>
    );
}