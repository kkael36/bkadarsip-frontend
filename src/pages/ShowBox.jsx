import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ShowBox() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [box, setBox] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/boxes/${id}`);
                // Sesuaikan jika backend kamu pakai res.data.data
                setBox(res.data.data || res.data); 
            } catch (error) {
                console.error("Gagal menarik data box:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <div className="text-slate-400 font-bold animate-pulse text-[11px] uppercase tracking-widest">Memuat Detail Box...</div>
            </div>
        );
    }

    if (!box) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in zoom-in-95 duration-300">
                <i className="bi bi-box-seam text-5xl text-slate-200 mb-4 block"></i>
                <div className="text-slate-400 font-bold text-sm">Data Box tidak ditemukan!</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in mt-6 font-sans text-slate-700">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Detail Box Fisik</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Informasi lengkap identitas dan lokasi penyimpanan box arsip</p>
        </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-full md:w-auto bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 px-8 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
                    >
                        Kembali
                    </button>
                </div>
            </div>

            {/* KONTEN DETAIL */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-6 mx-auto space-y-8">
                
                {/* Section 1: Identitas Box */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Identitas Box</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoItem label="Nomor Box" value={box.nomor_box} highlight highlightText="text-indigo-600" />
                        <InfoItem label="Tahun" value={box.tahun} />
                        <InfoItem label="Kode Klasifikasi" value={box.kode_klasifikasi} />
                    </div>
                </div>

                {/* Section 2: Lokasi Penyimpanan */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Lokasi Penyimpanan</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoItem label="Nama Rak (Zona)" value={box.nama_rak} highlight />
                        <InfoItem label="Nomor Rak (Urutan)" value={box.nomor_rak} highlight />
                    </div>
                </div>

                {/* Section 3: Informasi Tambahan */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informasi Tambahan</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <InfoItem label="Keterangan / Catatan" value={box.keterangan} />
                    </div>
                </div>

            </div>
        </div>
    );
}

// Komponen kecil untuk merapikan baris data (sama dengan ShowArsip)
const InfoItem = ({ label, value, highlight = false, highlightText = "text-slate-800" }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`text-sm font-medium ${highlightText} ${highlight ? 'bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl inline-block' : ''}`}>
            {value || <span className="text-slate-300 italic">Tidak ada</span>}
        </div>
    </div>
);