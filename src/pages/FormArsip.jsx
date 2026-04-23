import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; 
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
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const [ocrDebug, setOcrDebug] = useState(null);

  // --- STATE CROP & MODAL ---
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(); 
  const [completedCrop, setCompletedCrop] = useState();
  const [showModal, setShowModal] = useState(false);

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

  // --- 🔥 STYLE CROP: GARIS TIPIS & HANDLE KECIL ---
  const customCropStyles = `
    .ReactCrop__selection-border { 
      border: 1px solid #2563eb !important; 
    }
    .ReactCrop__drag-handle {
      width: 12px !important;
      height: 12px !important;
      background-color: #2563eb !important;
      border: 1px solid white !important;
      border-radius: 3px !important;
    }
    .ReactCrop__drag-handle::after {
      display: none !important;
    }
  `;

  useEffect(() => {
    if (timeLeft === 0) handleExpire();
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleExpire = async () => {
    const urlToDelete = form.file_dokumen;
    setPreview(null); setEnhanced(null); setTimeLeft(null);
    setForm(prev => ({ ...prev, file_dokumen: "" }));
    if (timerRef.current) clearInterval(timerRef.current);
    if (urlToDelete) {
      try {
        await api.delete("/delete-temp-file", { data: { filename: urlToDelete } });
        setAlert({ show: true, message: "Sesi habis. Foto dihapus otomatis.", type: "hapus" });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
      } catch (error) { console.error("Gagal hapus:", error); }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSelectFile = (image) => {
    setImgSrc(image);
    setShowModal(true);
  };

  const onImageLoad = (e) => {
    // Krop awal dikecilin dikit biar handles gak mepet banget ke pinggir container
    setCrop({
      unit: '%',
      x: 5,
      y: 5,
      width: 90,
      height: 90
    });
  };

  const executeCropAndUpload = async () => {
    if (completedCrop && imgRef.current) {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width * scaleX;
      canvas.height = completedCrop.height * scaleY;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.6);
      setShowModal(false);
      handleUpload(base64);
    }
  };

  const handleUpload = async (image) => {
    setPreview(image); setLoading(true); setOcrDebug(null);
    setAlert({ show: true, message: "Sistem Sedang Membaca Dokumen...", type: "info" });
    try {
      const blob = await fetch(image).then(r => r.blob());
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload-sp2d", formData);
      if (res.data.success) {
        setForm(prev => ({ ...prev, ...res.data, file_dokumen: res.data.file_dokumen }));
        setEnhanced(res.data.file_dokumen);
        setAlert({ show: true, message: "OCR Berhasil!", type: "update" });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
        setTimeLeft(180);
      }
    } catch (error) {
      setAlert({ show: true, message: "Gagal memproses dokumen.", type: "hapus" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/arsip", form);
      if (res.data.success) {
        setAlert({ show: true, message: "Arsip Berhasil Disimpan!", type: "simpan" });
        setTimeout(() => navigate("/arsip"), 2000);
      }
    } catch (error) {
      if (error.response?.status === 422) setErrors(error.response.data.errors);
      setAlert({ show: true, message: "Periksa kembali data.", type: "hapus" });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700 pb-20">
      <style>{customCropStyles}</style>
      
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* --- MODAL CROP (VERSI RAMPING & FIT) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl flex flex-col w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Potong Dokumen</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 text-xl">×</button>
            </div>
            
            <div className="bg-slate-900 flex justify-center items-center p-2">
              <div className="relative w-full max-h-[40vh] flex justify-center items-center overflow-hidden rounded-lg">
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                  <img 
                    ref={imgRef} src={imgSrc} alt="Source" onLoad={onImageLoad}
                    className="max-w-full max-h-[40vh] object-contain block mx-auto"
                  />
                </ReactCrop>
              </div>
            </div>

            <div className="p-4 bg-white border-t flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-600">BATAL</button>
              <button onClick={executeCropAndUpload} className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-[10px] shadow-lg shadow-indigo-100 active:scale-95 transition-all">POTONG & SCAN</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER AREA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Input Arsip Baru</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Gunakan pemindaian otomatis untuk efisiensi</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-xs font-bold border border-slate-200/50">Kembali</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-8 rounded-[1.8rem] border border-dashed border-slate-200 group hover:border-indigo-400 transition-all cursor-pointer text-center">
              <DocumentScanner onCrop={handleSelectFile} />
            </div>
          </div>

          {(preview || enhanced) && (
            <div className="sticky top-6 animate-in fade-in zoom-in-95">
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-2 text-center">
                <div className="relative rounded-[1.8rem] overflow-hidden bg-slate-950">
                  <img src={enhanced || preview} className="w-full h-auto" alt="Preview" />
                  {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">Membaca Dokumen...</div>}
                </div>
                <button onClick={handleExpire} className="mt-2 py-3 text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase transition-all">× Batalkan & Hapus</button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN */}
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
                <Input label="Jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} />
                <Input label="Perkembangan" name="tingkat_pengembangan" value={form.tingkat_pengembangan} onChange={handleChange} />
              </div>
              <Input label="Unit Pencipta" name="unit_pencipta" value={form.unit_pencipta} onChange={handleChange} />
              <Textarea label="Keperluan" name="keperluan" value={form.keperluan} onChange={handleChange} error={errors.keperluan} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Terlampir" name="terlampir" value={form.terlampir} onChange={handleChange} />
                <Input label="Nominal" name="nominal" value={form.nominal} onChange={handleChange} error={errors.nominal} />
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Box Sementara" name="no_box_sementara" value={form.no_box_sementara} onChange={handleChange} />
                <Input label="Box Permanen" name="no_box_permanen" value={form.no_box_permanen} onChange={handleChange} />
                <Select label="Kondisi" name="kondisi" value={form.kondisi} onChange={handleChange} options={['Baik', 'Rusak', 'Lembab', 'Terbakar']} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="JRA Aktif" name="jra_aktif" type="number" value={form.jra_aktif} onChange={handleChange} />
                <Input label="JRA Inaktif" name="jra_inaktif" type="number" value={form.jra_inaktif} onChange={handleChange} />
              </div>
              <Input label="Nasib Akhir" name="nasib_akhir" value={form.nasib_akhir} onChange={handleChange} />
            </div>

            <button type="submit" disabled={isSaving || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? "Menyimpan..." : "Simpan Arsip Digital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
const Input = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input value={value ?? ""} {...props} className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-50'}`} />
    {error && <span className="text-[9px] text-red-500 font-bold ml-1">{error[0]}</span>}
  </div>
);

const Select = ({ label, options, value, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all min-h-[100px] resize-none" />
  </div>
);