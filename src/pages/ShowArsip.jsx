import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ShowArsip() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [arsip, setArsip] = useState(null);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = "https://bkadarsip-backend-production.up.railway.app";

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await api.get(`/arsip/${id}`);
                setArsip(res.data.data);
            } catch (error) {
                console.error("Gagal menarik data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const formatIDR = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <div className="text-slate-400 font-bold animate-pulse text-[11px] uppercase tracking-widest">Memuat Detail Arsip...</div>
            </div>
        );
    }

    if (!arsip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in zoom-in-95 duration-300">
                <i className="bi bi-file-earmark-x text-5xl text-slate-200 mb-4 block"></i>
                <div className="text-slate-400 font-bold text-sm">Data Arsip tidak ditemukan!</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Detail Arsip</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Informasi lengkap rincian arsip</p>
        </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex-1 md:flex-none bg-slate-100 text-slate-500 hover:bg-slate-200 px-6 py-2.5 rounded-full text-xs font-bold transition-all"
                    >
                        Kembali
                    </button>
                    {arsip.file_dokumen && (
                        <a 
                            href={`${BACKEND_URL}/storage/${arsip.file_dokumen}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm shadow-indigo-200"
                        >
                            <i className="bi bi-file-earmark-pdf-fill"></i> Lihat Dokumen Asli
                        </a>
                    )}
                </div>
            </div>

            {/* KONTEN DETAIL */}
            <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 max-w-5xl mx-auto space-y-8">
                
                {/* Section 1: Informasi Utama */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-indigo-600 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Informasi Utama</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InfoItem label="Nomor Surat" value={arsip.no_surat} highlight />
                        <InfoItem label="Kode Klasifikasi" value={arsip.kode_klas} />
                        <InfoItem label="Tahun" value={arsip.tahun} />
                        <InfoItem label="Nominal" value={formatIDR(arsip.nominal)} highlightText="text-indigo-600" />
                        <InfoItem label="Jumlah Berkas" value={arsip.jumlah} />
                        <InfoItem label="Tingkat Perkembangan" value={arsip.tingkat_pengembangan} />
                        <div className="md:col-span-2 lg:col-span-3">
                            <InfoItem label="Unit Pencipta" value={arsip.unit_pencipta} />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                            <InfoItem label="Uraian Keperluan" value={arsip.keperluan} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Lokasi & Kondisi */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Penyimpanan & Kondisi</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoItem label="No Box Sementara" value={arsip.no_box_sementara} />
                        <InfoItem label="No Box Permanen" value={arsip.no_box_permanen} />
                        <InfoItem label="Kondisi Fisik" value={arsip.kondisi} />
                    </div>
                </div>

                {/* Section 3: JRA */}
                <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                        <div className="w-1.5 h-4 bg-amber-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jadwal Retensi (JRA) & Akhir</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <InfoItem label="JRA Aktif" value={`${arsip.jra_aktif} Tahun`} />
                        <InfoItem label="JRA Inaktif" value={`${arsip.jra_inaktif} Tahun`} />
                        <InfoItem label="Nasib Akhir" value={arsip.nasib_akhir} />
                        <InfoItem label="Rekomendasi" value={arsip.rekomendasi} />
                        <div className="md:col-span-2 lg:col-span-4">
                            <InfoItem label="Keterangan Tambahan" value={arsip.keterangan || "-"} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Komponen kecil untuk merapikan baris data
const InfoItem = ({ label, value, highlight = false, highlightText = "text-slate-800" }) => (
    <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <div className={`text-sm font-medium ${highlightText} ${highlight ? 'bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl inline-block' : ''}`}>
            {value || "-"}
        </div>
    </div>
);