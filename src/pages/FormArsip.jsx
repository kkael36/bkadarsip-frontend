import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
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
    kode_klas: "", no_surat: "", keperluan: "", unit_pencipta: "",
    tahun: "", jumlah: "1 Berkas", nominal: "", no_box_sementara: "",
    tingkat_pengembangan: "Asli", no_box_permanen: "", kondisi: "Baik",
    jra_aktif: 2, jra_inaktif: 5, nasib_akhir: "Dinilai Kembali",
    rekomendasi: "Usul Musnah", keterangan: "Tidak Ada", terlampir: "",
    file_dokumen: "" 
  };

  const [form, setForm] = useState(initialForm);

  // --- 🔥 STYLE OVERRIDE BUAT CROP WARNA BIRU ---
  const blueCropStyles = `
    .ReactCrop__selection-border { border: 2px solid #4f46e5 !important; }
    .ReactCrop__drag-handle::after { 
        background-color: #4f46e5 !important; 
        border: 1px solid white !important;
        width: 10px !important;
        height: 10px !important;
    }
  `;

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  useEffect(() => {
    if (timeLeft === 0) handleExpire();
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
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
        setAlert({ show: true, message: "Sesi habis. Data aman.", type: "hapus" });
      } catch (error) { console.error(error); }
    }
  };

  const onSelectFile = (image) => {
    setImgSrc(image);
    setShowModal(true);
  };

  // 🔥 BIAR CROP LANGSUNG FULL PAS BUKA
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = {
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    };
    setCrop(initialCrop);
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

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // 🔥 COMPRESS: Kualitas 0.6 biar file kecil (KB)
      const base64 = canvas.toDataURL('image/jpeg', 0.6);
      setShowModal(false);
      handleUpload(base64);
    }
  };

  const handleUpload = async (image) => {
    setPreview(image); setLoading(true); setOcrDebug(null);
    setAlert({ show: true, message: "Membaca Dokumen...", type: "info" });
    try {
      const blob = await fetch(image).then(r => r.blob());
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload-sp2d", formData);
      if (res.data.success) {
        setOcrDebug(res.data.raw_ocr);
        setForm(prev => ({
          ...prev,
          kode_klas: res.data.kode_klas || prev.kode_klas,
          no_surat: res.data.no_surat || prev.no_surat,
          tahun: res.data.tahun || prev.tahun,
          nominal: res.data.nominal || prev.nominal,
          keperluan: res.data.keperluan || prev.keperluan,
          file_dokumen: res.data.file_dokumen
        }));
        setEnhanced(res.data.file_dokumen);
        setAlert({ show: true, message: "OCR Berhasil!", type: "update" });
        setTimeLeft(180);
      }
    } catch (e) {
      setAlert({ show: true, message: "Gagal Scan.", type: "hapus" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/arsip", form);
      if (res.data.success) {
        setAlert({ show: true, message: "Tersimpan!", type: "simpan" });
        setTimeout(() => navigate("/arsip"), 2000);
      }
    } catch (e) {
      if (e.response?.status === 422) setErrors(e.response.data.errors);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 mt-6 pb-20 font-sans text-slate-700 animate-in fade-in duration-500">
      <style>{blueCropStyles}</style>
      
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* --- MODAL CROP (SMALL & CENTERED) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-widest">Atur Area Scan</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 text-2xl">×</button>
            </div>
            
            <div className="p-4 bg-slate-50 overflow-hidden flex justify-center">
              <ReactCrop 
                crop={crop} 
                onChange={(c) => setCrop(c)} 
                onComplete={(c) => setCompletedCrop(c)}
              >
                <img 
                  ref={imgRef} 
                  src={imgSrc} 
                  alt="Raw" 
                  onLoad={onImageLoad}
                  className="max-h-[50vh] w-auto object-contain" 
                />
              </ReactCrop>
            </div>

            <div className="p-5 bg-white border-t flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-bold text-slate-400">BATAL</button>
              <button onClick={executeCropAndUpload} className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">POTONG & SCAN</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-slate-900 leading-none">Input Arsip</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Digitalisasi SP2D Otomatis</p>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-xs font-bold">Kembali</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-slate-50/50 p-8 rounded-[1.8rem] border border-dashed border-slate-200 text-center">
              <DocumentScanner onCrop={onSelectFile} />
            </div>
          </div>

          {(preview || enhanced) && (
            <div className="sticky top-6">
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-2 overflow-hidden">
                <div className="relative rounded-[1.8rem] overflow-hidden">
                  <img src={enhanced || preview} className="w-full h-auto" alt="Preview" />
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center">
                      <div className="text-xs font-black text-indigo-600 animate-pulse tracking-[0.2em]">ANALYZING...</div>
                    </div>
                  )}
                </div>
                <button onClick={handleExpire} className="w-full mt-2 py-4 text-[10px] font-bold text-slate-300 hover:text-red-500 uppercase transition-all">× Batalkan</button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Kode Klas" name="kode_klas" value={form.kode_klas} onChange={handleChange} error={errors.kode_klas} />
                <Input label="Nomor Surat" name="no_surat" value={form.no_surat} onChange={handleChange} error={errors.no_surat} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Tahun" name="tahun" value={form.tahun} onChange={handleChange} error={errors.tahun} />
                <Input label="Jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} />
                <Input label="Tingkat Perkembangan" name="tingkat_pengembangan" value={form.tingkat_pengembangan} onChange={handleChange} />
              </div>
              <Input label="Unit Pencipta" name="unit_pencipta" value={form.unit_pencipta} onChange={handleChange} />
              <Textarea label="Uraian Informasi" name="keperluan" value={form.keperluan} onChange={handleChange} />
              <Input label="Nominal (Rp)" name="nominal" value={form.nominal} onChange={handleChange} />
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="No Box Sementara" name="no_box_sementara" value={form.no_box_sementara} onChange={handleChange} />
                <Input label="No Box Permanen" name="no_box_permanen" value={form.no_box_permanen} onChange={handleChange} />
                <Select label="Kondisi" name="kondisi" value={form.kondisi} onChange={handleChange} options={['Baik', 'Rusak', 'Lembab']} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-6">
              <Input label="JRA Aktif" name="jra_aktif" type="number" value={form.jra_aktif} onChange={handleChange} />
              <Input label="JRA Inaktif" name="jra_inaktif" type="number" value={form.jra_inaktif} onChange={handleChange} />
            </div>

            <button type="submit" disabled={isSaving || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? "Menyimpan..." : "Simpan Arsip Digital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- ATOM COMPONENTS ---
const Input = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input value={value ?? ""} {...props} className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all ${error ? 'border-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-50'}`} />
    {error && <span className="text-[9px] text-red-500 font-bold ml-1">{error[0]}</span>}
  </div>
);

const Select = ({ label, options, value, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none outline-none" />
  </div>
);