import { useState, useEffect } from 'react';

export default function FilterBox({ 
    isOpen, 
    onClose, 
    currentFilters, 
    onApply, 
    uniqueYears, 
    uniqueKlasifikasi, 
    uniqueNamaRak, 
    sliderMax 
}) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const leftPercent = Math.min(100, Math.max(0, (localFilters.minRak / sliderMax) * 100));
    const rightPercent = Math.min(100, Math.max(0, 100 - (localFilters.maxRak / sliderMax) * 100));

    const activeLocalCount = [
        localFilters.tahun !== '',
        localFilters.kode_klasifikasi !== '',
        localFilters.nama_rak !== '',
        localFilters.minRak > 0 || localFilters.maxRak < sliderMax
    ].filter(Boolean).length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <style>{`
                .custom-range-box::-webkit-slider-thumb {
                    pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
                    background: #4f46e5; cursor: pointer; -webkit-appearance: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 3px solid white;
                }
                .custom-range-box::-moz-range-thumb {
                    pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
                    background: #4f46e5; cursor: pointer; border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
            `}</style>

            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Filter Data Box</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Saring berdasarkan kriteria penyimpanan</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm outline-none">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar text-left">
                    
                    {/* Filter Kode Klasifikasi */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kode Klasifikasi</label>
                        <select 
                            value={localFilters.kode_klasifikasi} 
                            onChange={(e) => setLocalFilters({...localFilters, kode_klasifikasi: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Klasifikasi</option>
                            {uniqueKlasifikasi.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>

                    {/* Filter Tahun */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun Arsip di Box</label>
                        <select 
                            value={localFilters.tahun} 
                            onChange={(e) => setLocalFilters({...localFilters, tahun: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Filter Nama Rak */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gedung / Nama Rak</label>
                        <select 
                            value={localFilters.nama_rak} 
                            onChange={(e) => setLocalFilters({...localFilters, nama_rak: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Rak</option>
                            {uniqueNamaRak.map(r => <option key={r} value={r}>Rak {r}</option>)}
                        </select>
                    </div>

                    {/* Filter Rentang Nomor Rak */}
                    <div className="flex flex-col gap-3 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                            <span>Rentang Nomor Rak / Sekat</span>
                            <span className="text-indigo-500 lowercase normal-case">Pilih Nomor Box</span>
                        </label>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative w-full flex items-center">
                                <span className="absolute left-4 text-xs font-bold text-slate-400 uppercase">Min</span>
                                {/* 🔥 Input Min: Filter huruf, cuma angka yang lolos */}
                                <input 
                                    type="text" 
                                    value={localFilters.minRak === 0 ? '' : localFilters.minRak} 
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        setLocalFilters({...localFilters, minRak: Number(rawValue)});
                                    }}
                                    placeholder="0"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-3 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                            <span className="text-slate-300 font-black">-</span>
                            <div className="relative w-full flex items-center">
                                <span className="absolute left-4 text-xs font-bold text-slate-400 uppercase">Max</span>
                                {/* 🔥 Input Max: Filter huruf, cuma angka yang lolos */}
                                <input 
                                    type="text" 
                                    value={localFilters.maxRak === 0 ? '' : localFilters.maxRak} 
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        setLocalFilters({...localFilters, maxRak: Number(rawValue)});
                                    }}
                                    placeholder="0"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-12 pr-3 py-3 text-sm font-bold text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="relative w-full h-2 bg-slate-100 rounded-full mt-4 mb-2">
                            <div className="absolute h-full bg-indigo-500 rounded-full" style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}></div>
                            <input 
                                type="range" min="0" max={sliderMax} step="1" 
                                value={localFilters.minRak} 
                                onChange={e => setLocalFilters({...localFilters, minRak: Math.min(Number(e.target.value), localFilters.maxRak - 1)})}
                                className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none custom-range-box"
                            />
                            <input 
                                type="range" min="0" max={sliderMax} step="1" 
                                value={Math.min(localFilters.maxRak, sliderMax)} 
                                onChange={e => setLocalFilters({...localFilters, maxRak: Math.max(Number(e.target.value), Number(localFilters.minRak) + 1)})}
                                className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none custom-range-box"
                            />
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
                    <button 
                        onClick={() => setLocalFilters({ tahun: '', kode_klasifikasi: '', nama_rak: '', minRak: 0, maxRak: sliderMax })}
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