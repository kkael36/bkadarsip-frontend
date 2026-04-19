import React from 'react';

const ConfirmModal = ({ show, message, type, onConfirm, onCancel }) => {
  if (!show) return null;

  const config = {
    hapus: {
      border: "border-red-500",
      btn: "bg-red-600 hover:bg-red-700",
      label: "KONFIRMASI HAPUS",
    },
    simpan: {
      border: "border-green-500",
      btn: "bg-green-600 hover:bg-green-700",
      label: "KONFIRMASI SIMPAN",
    },
    update: {
      border: "border-blue-500",
      btn: "bg-blue-600 hover:bg-blue-700",
      label: "KONFIRMASI UPDATE",
    }
  };

  const style = config[type] || config.update;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop: Opacity dikecilkan agar lebih clean */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={onCancel}></div>
      
      {/* Modal Card: Shadow standar, rounded standar */}
      <div className={`relative bg-white w-full max-w-xs rounded-2xl shadow-xl border-t-2 ${style.border} p-6 animate-in zoom-in-95 duration-200`}>
        <div className="text-center">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-3 block">
            {style.label}
          </span>
          
          <p className="text-slate-700 font-semibold text-base leading-relaxed mb-6">
            {message}
          </p>
          
          <div className="space-y-2">
            <button 
              onClick={onConfirm}
              className={`w-full py-2.5 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${style.btn}`}
            >
              Ya, Lanjutkan
            </button>
            <button 
              onClick={onCancel}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;