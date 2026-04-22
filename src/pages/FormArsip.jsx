import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop"; // Pake Easy Crop sesuai request
import api from "../services/api";
import Alert from "../components/Alert";

// --- HELPER: PROSES POTONG GAMBAR ---
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = (e) => reject(e);
  });
};

export default function FormArsip() {
  const navigate = useNavigate();
  
  // --- UI & ALERT STATE ---
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState({});
  const [ocrDebug, setOcrDebug] = useState(null);

  // --- CROP STATE (MODAL & FREE ROAM) ---
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // --- FORM & PREVIEW STATE ---
  const [preview, setPreview] = useState(null);
  const [enhanced, setEnhanced] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const initialForm = {
    kode_klas: "", no_surat: "", keperluan: "", unit_pencipta: "",
    tahun: "", jumlah: "1 Berkas", nominal: "", no_box_sementara: "",
    tingkat_pengembangan: "Asli", no_box_permanen: "", kondisi: "Baik",
    jra_aktif: 2, jra_inaktif: 5, nasib_akhir: "Dinilai Kembali",
    rekomendasi: "Usul Musnah", keterangan: "Tidak Ada", terlampir: "",
    file_dokumen: "" 
  };
  const [form, setForm] = useState(initialForm);

  // --- LOGIKA TIMER ---
  useEffect(() => {
    if (timeLeft === 0) handleExpire();
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleExpire = async () => {
    const url = form.file_dokumen;
    setPreview(null); setEnhanced(null); setTimeLeft(null);
    setForm(prev => ({ ...prev, file_dokumen: "" }));
    if (url) {
      try { await api.delete("/delete-temp-file", { data: { filename: url } }); } 
      catch (e) { console.error("Auto-delete failed", e); }
    }
  };

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  // --- HANDLER SELECT FILE ---
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setShowModal(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // --- EKSEKUSI POTONG & UPLOAD ---
  const handleDoCrop = async () => {
    try {
      setLoading(true);
      setShowModal(false);
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      setPreview(croppedBase64);
      
      // Kirim ke Backend untuk OCR
      setAlert({ show: true, message: "Membaca Dokumen (OCR)...", type: "info" });
      
      const blob = await fetch(croppedBase64).then(r => r.blob());
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload-sp2d", formData);
      
      if (res.data.success) {
        setOcrDebug({ raw: res.data.raw_ocr, parsed: res.data });
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
      setAlert({ show: true, message: "Gagal memproses gambar.", type: "hapus" });
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/arsip", form);
      if (res.data.success) {
        setAlert({ show: true, message: "Berhasil!", type: "simpan" });
        setTimeout(() => navigate("/arsip"), 2000);
      }
    } catch (e) {
      if (e.response?.status === 422) setErrors(e.response.data.errors);
      setAlert({ show: true, message: "Gagal simpan data.", type: "hapus" });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 mt-6 pb-20 font-sans text-slate-700 animate-in fade-in duration-500">
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* --- MODAL CROP (FREE ROAM) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Potong Dokumen</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Gunakan kotak untuk area dokumen</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-2xl hover:text-red-500 transition-colors">×</button>
            </div>
            
            <div className="relative h-[400px] bg-slate-100">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={null} // <--- INI BIAR FREE ROAM (BEBAS RATIO)
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="p-6 bg-white border-t space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Zoom</span>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1" />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Batal</button>
                <button onClick={handleDoCrop} className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">Potong & Scan Sekarang</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Input Arsip</h2>
          <p className="text-xs text-slate-400 font-medium">Scan dokumen dengan free cropping system</p>
        </div>
        <button onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 px-6 py-2 rounded-xl text-xs font-bold border border-slate-200/50 hover:bg-slate-200 transition-all">Kembali</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
            <label className="bg-slate-50/50 p-10 rounded-[1.8rem] border border-dashed border-slate-200 group hover:border-indigo-400 transition-all cursor-pointer text-center block relative">
              <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              <i className="bi bi-camera text-3xl text-indigo-500 mb-2 block"></i>
              <span className="text-sm font-bold text-slate-600">Klik untuk Pilih Foto</span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">Free Crop & Auto OCR</p>
            </label>
          </div>

          {(preview || enhanced) && (
            <div className="sticky top-6">
              <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm p-2">
                <div className="relative rounded-[1.8rem] overflow-hidden bg-slate-50">
                  <img src={enhanced || preview} className="w-full h-auto" alt="Preview" />
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 shadow-xl animate-pulse">MEMBACA DOKUMEN...</div>
                    </div>
                  )}
                  {timeLeft !== null && !loading && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2 rounded-full text-[11px] font-bold border border-white/10 flex items-center gap-2">
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                       HAPUS OTOMATIS: <span className="text-red-400">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>
                <button onClick={handleExpire} className="w-full mt-2 py-4 text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase transition-all">× Batalkan & Hapus</button>
              </div>
            </div>
          )}
          
          {/* DEBUG AREA */}
          {ocrDebug && (
            <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-[10px] font-mono shadow-xl opacity-80">
              <p className="text-indigo-400 mb-2">RAW OCR RESULT:</p>
              <p className="whitespace-pre-wrap">{ocrDebug.raw?.substring(0, 500)}...</p>
            </div>
          )}
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Dokumen</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Kode Klas" name="kode_klas" value={form.kode_klas} onChange={handleChange} error={errors.kode_klas} />
                <Input label="Nomor Surat" name="no_surat" value={form.no_surat} onChange={handleChange} error={errors.no_surat} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Tahun" name="tahun" value={form.tahun} onChange={handleChange} error={errors.tahun} />
                <Input label="Jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} />
                <Input label="Nominal (Rp)" name="nominal" value={form.nominal} onChange={handleChange} error={errors.nominal} />
              </div>
              <Input label="Unit Pencipta" name="unit_pencipta" value={form.unit_pencipta} onChange={handleChange} error={errors.unit_pencipta} />
              <Textarea label="Uraian Informasi" name="keperluan" value={form.keperluan} onChange={handleChange} error={errors.keperluan} />
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
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

            <button type="submit" disabled={isSaving || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg transition-all active:scale-95 disabled:opacity-50">
              {isSaving ? "Menyimpan..." : loading ? "Sedang OCR..." : "Simpan Arsip Digital"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
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
    <textarea value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm min-h-[120px] resize-none outline-none" />
  </div>
);