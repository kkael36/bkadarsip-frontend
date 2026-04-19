import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RackModal({
  rack,
  boxes = [], 
  onClose,
  onSelectNumber,
  selectedNumber,
}) {
  const navigate = useNavigate();

  const numbers = Array.from(
    { length: rack.to - rack.from + 1 },
    (_, i) => String(rack.from + i)
  );

  const activeBoxes = boxes.filter(
    (box) => box.nama_rak === rack.prefix && box.nomor_rak === selectedNumber
  );

  return (
    /* 🔥 FIX BLUR FULL LAYAR: Pakai fixed inset-0 dan z-index tinggi */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* OVERLAY / BACKDROP */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-left font-sans">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h3 className="font-bold text-slate-800 text-xl tracking-tight">
              Rak {rack.label} (Zona {rack.prefix})
            </h3>
            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Detail Penyimpanan Sekat</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors outline-none">
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-1">
          
          {/* 1. PILIH NOMOR */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">1. Pilih Nomor Sekat</h4>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
              {numbers.map((num) => {
                const hasBox = boxes.some(b => b.nama_rak === rack.prefix && b.nomor_rak === num);
                return (
                  <button
                    key={num}
                    onClick={() => onSelectNumber(num)}
                    className={`h-10 rounded-xl text-sm font-bold transition-all border outline-none relative ${
                      selectedNumber === num
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    {num}
                    {hasBox && selectedNumber !== num && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ISI BOX */}
          <div className="flex flex-col flex-1">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">2. Daftar Isi Box</h4>
            
            {!selectedNumber ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center flex-1 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-tight">Pilih nomor sekat di atas</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeBoxes.length === 0 ? (
                    <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-8 text-center">
                        <p className="text-sm font-medium text-slate-400 italic">Belum ada box di sekat ini</p>
                    </div>
                ) : (
                    activeBoxes.map((box) => (
                        <div key={box.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex justify-between items-center group transition-all">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                              <i className="bi bi-archive text-lg"></i>
                            </div>
                            
                            {/* AREA DATA: NOMOR BOX -> TAHUN -> KETERANGAN */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                                <div className="min-w-[70px]">
                                    <p className="font-bold text-slate-700 text-sm leading-none">{box.nomor_box}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Klas: {box.kode_klasifikasi || '-'}</p>
                                </div>

                                {/* 🔥 TAHUN GESER KE KIRI (SETELAH INFO BOX) */}
                                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {box.tahun || '-'}
                                </div>

                                {/* 🔥 KETERANGAN SETELAH TAHUN */}
                                {box.keterangan && (
                                    <span className="text-[10px] text-slate-400 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate max-w-[180px]">
                                        {box.keterangan}
                                    </span>
                                )}
                            </div>
                          </div>
                          
                          {/* 🔥 TOMBOL MATA HOVER BIRU */}
                          <button 
                              onClick={() => navigate(`/show-box/${box.id}`)}
                              className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm outline-none border border-slate-100"
                              title="Lihat Detail Box"
                          >
                              <i className="bi bi-eye text-base"></i>
                          </button>
                        </div>
                    ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}