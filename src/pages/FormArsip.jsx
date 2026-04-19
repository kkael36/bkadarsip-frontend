import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DocumentScanner from "../components/DocumentScanner";
import api from "../services/api";
import Alert from "../components/Alert";

export default function FormArsip() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [enhanced, setEnhanced] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState({});

  // 🔥 STATE TIMER EXPIRED
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const initialForm = {
    kode_klas: "",
    no_surat: "",
    keperluan: "",
    unit_pencipta: "",
    tahun: "",
    jumlah: "1 Berkas",
    nominal: "",
    no_box_sementara: "",
    tingkat_pengembangan: "Asli",
    no_box_permanen: "",
    kondisi: "Baik",
    jra_aktif: 2,
    jra_inaktif: 5,
    nasib_akhir: "Dinilai Kembali",
    rekomendasi: "Usul Musnah",
    keterangan: "Tidak Ada",
    terlampir: "",
    file_dokumen: "" 
  };

  const [form, setForm] = useState(initialForm);

  // 🔥 LOGIKA HITUNG MUNDUR & AUTO DELETE
  useEffect(() => {
    if (timeLeft === 0) {
      handleExpire();
    }
    if (timeLeft === null) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleExpire = async () => {
    const fileNameToDelete = form.file_dokumen;
    setPreview(null);
    setEnhanced(null);
    setTimeLeft(null);
    setForm(prev => ({ ...prev, file_dokumen: "" }));
    
    if (timerRef.current) clearInterval(timerRef.current);

    if (fileNameToDelete) {
      try {
        await api.delete("/delete-temp-file", { data: { filename: fileNameToDelete } });
        setAlert({ 
          show: true, 
          message: "Sesi habis. File dokumen telah dihapus otomatis dari server.", 
          type: "hapus" 
        });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
      } catch (error) {
        console.error("Gagal menghapus file di server:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleUpload = async (image) => {
    setPreview(image); 
    setEnhanced(null); 
    setLoading(true);
    setAlert({ show: true, message: "Sistem Sedang Membaca Dokumen...", type: "info" });

    try {
      const blob = await fetch(image).then(r => r.blob());
      const file = new File([blob], "scan.jpg");
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload-sp2d", formData);
      if (res.data.success) {
        setEnhanced(res.data.image_enhanced);
        setForm(prev => ({
          ...prev,
          kode_klas: res.data.kode_klas || prev.kode_klas,
          no_surat: res.data.no_surat || prev.no_surat,
          tahun: res.data.tahun || prev.tahun,
          nominal: res.data.nominal || prev.nominal,
          keperluan: res.data.keperluan || prev.keperluan,
          file_dokumen: res.data.file_dokumen
        }));
        
        setAlert({ show: true, message: "OCR Berhasil!", type: "update" });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000);
        setTimeLeft(300); 
      }
    } catch (error) {
      setAlert({ show: true, message: "Gagal memproses dokumen.", type: "hapus" });
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({}); 

    try {
      const res = await api.post("/arsip", form);
      if (res.data.success) {
        setAlert({ show: true, message: "Arsip Berhasil Disimpan!", type: "simpan" });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 3000);
        setForm(initialForm); setPreview(null); setEnhanced(null); setTimeLeft(null);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setAlert({ show: true, message: "Validasi Gagal.", type: "hapus" });
      } else {
        setAlert({ show: true, message: "Gagal menyimpan ke server.", type: "hapus" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700 pb-20">
      
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none ">Input Arsip Baru</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Gunakan pemindaian otomatis untuk efisiensi input data</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* 🔥 HINT LAMPU DENGAN KETERANGAN EXPIRED */}
          <div className="relative group">
            <button
              type="button"
              className="w-9 h-9 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-xl transition shadow-sm border border-slate-200/50"
              title="Informasi Sistem"
            >
              <i className="bi bi-lightbulb text-lg text-yellow-500 group-hover:text-yellow-300"></i>
            </button>

            <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-5 text-xs text-slate-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] leading-relaxed">
              <p className="font-bold text-slate-800 mb-2 uppercase tracking-widest text-[10px]">Keamanan Data Temporer</p>
              Foto dokumen bersifat temporer. Jika dalam <span className="font-bold text-red-500">5 menit</span> data tidak disimpan, foto akan dihapus otomatis dari memori server untuk menjaga keamanan arsip.
              <br /><br />
              Pengguna tetap diwajibkan melakukan pemeriksaan ulang terhadap seluruh data hasil OCR sebelum menyimpan arsip.
            </div>
          </div>

          <button type="button" onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-6 py-2 rounded-xl text-xs font-bold transition-all h-9 shadow-sm border border-slate-200/50">
            Kembali
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-5 space-y-6 lg:h-full">
          
          {/* BOX SCANNER (TETAP DI ATAS) */}
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-8 rounded-[1.8rem] border border-dashed border-slate-200 group hover:border-indigo-400 transition-all cursor-pointer text-center">
              <DocumentScanner onCrop={handleUpload} />
            </div>
          </div>

          {/* 🔥 PREVIEW IMAGE (IKUT SCROLL/STICKY) */}
          {preview && (
            <div className="sticky top-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm p-2">
                <div className="relative rounded-[1.8rem] overflow-hidden">
                  <img src={enhanced || preview} className="w-full h-auto" alt="Preview" />
                  
                  {timeLeft !== null && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-[11px] font-bold tracking-wider flex items-center gap-3 shadow-2xl border border-white/10 whitespace-nowrap">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      FOTO EXPIRED DALAM: <span className="font-black text-red-400">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleExpire}
                  className="w-full mt-2 py-4 text-[10px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 uppercase tracking-widest transition-all duration-300 rounded-xl outline-none"
                >
                  × Batalkan & Hapus Permanen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FORM AREA */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 space-y-8 text-left relative">
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Utama</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Kode Klas" name="kode_klas" value={form.kode_klas} onChange={handleChange} error={errors.kode_klas} />
                <Input label="Nomor Surat" name="no_surat" value={form.no_surat} onChange={handleChange} error={errors.no_surat} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Tahun" name="tahun" value={form.tahun} onChange={handleChange} error={errors.tahun} />
                <Input label="Jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} error={errors.jumlah} />
                <Input label="Tingkat Perkembangan" name="tingkat_pengembangan" value={form.tingkat_pengembangan} onChange={handleChange} error={errors.tingkat_pengembangan} />
              </div>
              <Input label="Unit Pencipta" name="unit_pencipta" value={form.unit_pencipta} onChange={handleChange} error={errors.unit_pencipta} />
              <Textarea label="Uraian Informasi" name="keperluan" value={form.keperluan} onChange={handleChange} error={errors.keperluan} />
              <Input label="Dokumen Terlampir" name="terlampir" value={form.terlampir} onChange={handleChange} error={errors.terlampir} />
              <Input label="Nominal (Rp)" name="nominal" value={form.nominal} onChange={handleChange} error={errors.nominal} />
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Penyimpanan & Kondisi</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="No Box Sementara" name="no_box_sementara" value={form.no_box_sementara} onChange={handleChange} error={errors.no_box_sementara} />
                <Input label="No Box Permanen" name="no_box_permanen" value={form.no_box_permanen} onChange={handleChange} error={errors.no_box_permanen} />
                <Select label="Kondisi" name="kondisi" value={form.kondisi} onChange={handleChange} error={errors.kondisi} options={['Baik', 'Rusak', 'Lembab', 'Terbakar']} />
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ketentuan JRA</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="JRA Aktif" name="jra_aktif" type="number" value={form.jra_aktif} onChange={handleChange} error={errors.jra_aktif} />
                <Input label="JRA Inaktif" name="jra_inaktif" type="number" value={form.jra_inaktif} onChange={handleChange} error={errors.jra_inaktif} />
                <Input label="Nasib Akhir" name="nasib_akhir" value={form.nasib_akhir} onChange={handleChange} error={errors.nasib_akhir} />
                <Input label="Rekomendasi" name="rekomendasi" value={form.rekomendasi} onChange={handleChange} error={errors.rekomendasi} />
              </div>
              <Input label="Keterangan" name="keterangan" value={form.keterangan} onChange={handleChange} error={errors.keterangan} />
            </div>

            <button
              type="submit"
              disabled={isSaving || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 outline-none"
            >
              {isSaving ? "Menyimpan ke Sistem..." : "Simpan Arsip Digital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- RENDER HELPERS ---
const Input = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input
      value={value ?? ""}
      {...props}
      className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all ${
        error ? 'border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-50'
      }`}
    />
    {error && <span className="text-[9px] text-red-500 font-bold ml-1">{error[0]}</span>}
  </div>
);

const Select = ({ label, options, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select
      value={value ?? ""}
      {...props}
      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea
      value={value ?? ""}
      {...props}
      className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all min-h-[100px] resize-none"
    />
  </div>
);