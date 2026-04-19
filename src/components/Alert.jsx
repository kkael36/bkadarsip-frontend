import React, { useEffect } from 'react';

const Alert = ({ message, type, onClose }) => {
  
  // Alert otomatis hilang dalam 3 detik
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Konfigurasi Warna & Ikon berdasarkan type
  const config = {
    simpan: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "✓",
      label: "Berhasil"
    },
    hapus: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "✕",
      label: "Dihapus"
    },
    update: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "ℹ",
      label: "Diperbarui"
    }
  };

  const style = config[type] || config.update;

  return (
    <div className="fixed top-5 right-5 z-[9999] animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${style.bg} ${style.border} border ${style.text} px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px]`}>
        {/* Ikon Bulat */}
        <div className={`w-6 h-6 flex items-center justify-center rounded-full bg-white/50 text-[10px] font-black`}>
          {style.icon}
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">
            {style.label}
          </span>
          <p className="text-sm font-bold tracking-tight">
            {message}
          </p>
        </div>

        {/* Tombol Close Manual */}
        <button 
          onClick={onClose}
          className="ml-auto hover:opacity-50 transition-opacity"
        >
          <span className="text-lg font-light">×</span>
        </button>
      </div>
    </div>
  );
};

export default Alert;