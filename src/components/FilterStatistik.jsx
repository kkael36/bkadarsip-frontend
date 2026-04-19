import { useState, useEffect } from 'react';

export default function FilterStatistik({ 
    isOpen, 
    onClose, 
    currentFilters, 
    onApply, 
    availableYears 
}) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) setLocalFilters(currentFilters);
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const MONTHS = [
        { val: '1', label: 'Januari' }, { val: '2', label: 'Februari' },
        { val: '3', label: 'Maret' }, { val: '4', label: 'April' },
        { val: '5', label: 'Mei' }, { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' }, { val: '8', label: 'Agustus' },
        { val: '9', label: 'September' }, { val: '10', label: 'Oktober' },
        { val: '11', label: 'November' }, { val: '12', label: 'Desember' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Filter Statistik</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Saring berdasarkan waktu upload</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm outline-none">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6 text-left">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rentang Waktu Utama</label>
                        <select 
                            value={localFilters.timeFilter} 
                            onChange={(e) => setLocalFilters({...localFilters, timeFilter: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="semua">Semua Waktu</option>
                            <option value="hari_ini">Di-Upload Hari Ini</option>
                            <option value="kustom">Pilih Bulan & Tahun Spesifik</option>
                        </select>
                    </div>

                    {localFilters.timeFilter === 'kustom' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bulan Awal</label>
                                    <select value={localFilters.monthStart} onChange={(e) => setLocalFilters({...localFilters, monthStart: e.target.value})} className="bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer">
                                        <option value="">Pilih...</option>
                                        {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bulan Akhir</label>
                                    <select value={localFilters.monthEnd} onChange={(e) => setLocalFilters({...localFilters, monthEnd: e.target.value})} className="bg-slate-50/50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer">
                                        <option value="">Pilih...</option>
                                        {MONTHS.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun Upload</label>
                                <select value={localFilters.year} onChange={(e) => setLocalFilters({...localFilters, year: e.target.value})} className="bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer">
                                    {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
                    <button 
                        onClick={() => setLocalFilters({ timeFilter: 'semua', monthStart: '', monthEnd: '', year: availableYears[0]?.toString() || '' })}
                        className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors outline-none"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={() => { onApply(localFilters); onClose(); }}
                        className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors outline-none"
                    >
                        Terapkan
                    </button>
                </div>
            </div>
        </div>
    );
}