import { useState, useEffect } from 'react';

export default function FilterSp2d({ 
    isOpen, 
    onClose, 
    currentFilters, 
    onApply, 
    uniqueYears, 
    uniqueNasibAkhir, 
    uniqueUnitPencipta, 
    sliderMax 
}) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    useEffect(() => {
        if (isOpen) {
            setLocalFilters(currentFilters);
        }
    }, [isOpen, currentFilters]);

    if (!isOpen) return null;

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    const leftPercent = Math.min(100, Math.max(0, (localFilters.minNominal / sliderMax) * 100));
    const rightPercent = Math.min(100, Math.max(0, 100 - (localFilters.maxNominal / sliderMax) * 100));

    const activeLocalCount = [
        localFilters.tahun !== '',
        localFilters.nasib_akhir !== '',
        localFilters.unit_pencipta !== '',
        localFilters.minNominal > 0 || localFilters.maxNominal < sliderMax
    ].filter(Boolean).length;

    // 🔥 Fungsi untuk format input pas ngetik (Biar ada titiknya)
    const formatInputRupiah = (val) => {
        if (!val || val === 0) return ''; // Kosongkan kalau 0 biar gampang ngetik ulang
        return Number(val).toLocaleString('id-ID');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <style>{`
                .custom-range::-webkit-slider-thumb {
                    pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
                    background: #4f46e5; cursor: pointer; -webkit-appearance: none;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2); border: 3px solid white;
                }
                .custom-range::-moz-range-thumb {
                    pointer-events: auto; width: 20px; height: 20px; border-radius: 50%;
                    background: #4f46e5; cursor: pointer; border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
            `}</style>

            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Filter Data SP2D</h3>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Saring berdasarkan kriteria spesifik</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm outline-none">
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar text-left">
                    
                    {/* Tahun */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun Dokumen</label>
                        <select 
                            value={localFilters.tahun} 
                            onChange={(e) => setLocalFilters({...localFilters, tahun: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Tahun</option>
                            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    {/* Rentang Nominal */}
                    <div className="flex flex-col gap-3 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                            <span>Rentang Nominal Uang</span>
                            <span className="text-indigo-500 lowercase normal-case">Pilih Nominal</span>
                        </label>
                        
                        <div className="flex items-center gap-3">
                            <div className="relative w-full">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                {/* 🔥 Input Min: Pakai Regex biar cuma bisa angka, dan toLocaleString biar ada titiknya */}
                                <input 
                                    type="text" 
                                    value={formatInputRupiah(localFilters.minNominal)} 
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/\D/g, ''); // Hapus semua selain angka
                                        setLocalFilters({...localFilters, minNominal: Number(rawValue)});
                                    }}
                                    placeholder="0"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                            <span className="text-slate-300 font-black">-</span>
                            <div className="relative w-full">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                                {/* 🔥 Input Max: Sama kayak input Min */}
                                <input 
                                    type="text" 
                                    value={formatInputRupiah(localFilters.maxNominal)} 
                                    onChange={e => {
                                        const rawValue = e.target.value.replace(/\D/g, ''); // Hapus semua selain angka
                                        setLocalFilters({...localFilters, maxNominal: Number(rawValue)});
                                    }}
                                    placeholder="0"
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-xl pl-10 pr-3 py-3 text-xs font-bold text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="relative w-full h-2 bg-slate-100 rounded-full mt-4 mb-2">
                            <div className="absolute h-full bg-indigo-500 rounded-full" style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}></div>
                            <input 
                                type="range" min="0" max={sliderMax} step="1000000" 
                                value={localFilters.minNominal} 
                                onChange={e => setLocalFilters({...localFilters, minNominal: Math.min(Number(e.target.value), localFilters.maxNominal - 1000000)})}
                                className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none custom-range"
                            />
                            <input 
                                type="range" min="0" max={sliderMax} step="1000000" 
                                value={Math.min(localFilters.maxNominal, sliderMax)} 
                                onChange={e => setLocalFilters({...localFilters, maxNominal: Math.max(Number(e.target.value), Number(localFilters.minNominal) + 1000000)})}
                                className="absolute w-full -top-2 appearance-none bg-transparent pointer-events-none custom-range"
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                            <span>{formatIDR(localFilters.minNominal)}</span>
                            <span>{formatIDR(localFilters.maxNominal)}</span>
                        </div>
                    </div>

                    {/* Unit Pencipta */}
                    <div className="flex flex-col gap-1.5 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit Pencipta</label>
                        <select 
                            value={localFilters.unit_pencipta} 
                            onChange={(e) => setLocalFilters({...localFilters, unit_pencipta: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Unit Pencipta</option>
                            {uniqueUnitPencipta.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>

                    {/* Nasib Akhir */}
                    <div className="flex flex-col gap-1.5 pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nasib Akhir Dokumen</label>
                        <select 
                            value={localFilters.nasib_akhir} 
                            onChange={(e) => setLocalFilters({...localFilters, nasib_akhir: e.target.value})}
                            className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none cursor-pointer"
                        >
                            <option value="">Semua Status</option>
                            {uniqueNasibAkhir.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-50 bg-white flex gap-3">
                    <button 
                        onClick={() => setLocalFilters({ tahun: '', minNominal: 0, maxNominal: sliderMax, nasib_akhir: '', unit_pencipta: '' })}
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