import { useState, useEffect } from 'react';

export default function FilterUser({ 
    isOpen, 
    onClose, 
    currentFilters, 
    onApply 
}) {
    // State lokal agar filter tidak langsung berubah sebelum klik "Terapkan"
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const roles = [
        { l: 'Super Admin', v: 'super_admin' },
        { l: 'Operator', v: 'operator' },
        { l: 'Viewer', v: 'viewer' }
    ];

    const statuses = [
        { l: 'Aktif', v: 'aktif' },
        { l: 'Nonaktif', v: 'nonaktif' }
    ];

    const activeLocalCount = [
        localFilters.role !== '',
        localFilters.status !== ''
    ].filter(Boolean).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
                {/* Header Style FilterSp2d */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Filter Pegawai</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Saring hak akses & status</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm outline-none">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-8 space-y-8 text-left">
                    {/* Filter Berdasarkan Hak Akses */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hak Akses Sistem</label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => setLocalFilters({ ...localFilters, role: '' })}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${localFilters.role === '' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                            >
                                Semua
                            </button>
                            {roles.map(r => (
                                <button 
                                    key={r.v}
                                    onClick={() => setLocalFilters({ ...localFilters, role: r.v })}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${localFilters.role === r.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                >
                                    {r.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filter Berdasarkan Status Akun */}
                    <div className="space-y-3 pt-6 border-t border-slate-50">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Keaktifan</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLocalFilters({ ...localFilters, status: '' })}
                                className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${localFilters.status === '' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                            >
                                Semua
                            </button>
                            {statuses.map(s => (
                                <button 
                                    key={s.v}
                                    onClick={() => setLocalFilters({ ...localFilters, status: s.v })}
                                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase transition-all border ${localFilters.status === s.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'}`}
                                >
                                    {s.l}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Buttons Style FilterSp2d */}
                <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
                    <button 
                        onClick={() => setLocalFilters({ role: '', status: '' })}
                        className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors outline-none"
                    >
                        Reset Filter
                    </button>
                    <button 
                        onClick={() => { onApply(localFilters); onClose(); }}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors outline-none"
                    >
                        Terapkan ({activeLocalCount})
                    </button>
                </div>
            </div>
        </div>
    );
}