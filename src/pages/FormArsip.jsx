import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; 
import DocumentScanner from "../components/DocumentScanner";
import api from "../services/api";
import Alert from "../components/Alert";

// Bootstrap Icons sudah ada di index.html lu
import "bootstrap-icons/font/bootstrap-icons.css";

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
  
  // --- 🔥 STATE HINT (NAMA SUDAH FIX) ---
  const [showMainHint, setShowMainHint] = useState(false);
  const [showModalHint, setShowModalHint] = useState(false);

  // --- STATE POTONG & MODAL ---
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

  const customCropStyles = `
    .ReactCrop__selection-border { border: 2px solid #4f46e5 !important; }
    .ReactCrop__drag-handle {
      width: 14px !important;
      height: 14px !important;
      background-color: #4f46e5 !important;
      border: 2px solid white !important;
      border-radius: 4px !important;
    }
    .ReactCrop__drag-handle::after { display: none !important; }
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
    setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
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
    setPreview(image); setLoading(true);
    setAlert({ show: true, message: "Sistem Sedang Membaca Dokumen...", type: "info" });
    try {
      const blob = await fetch(image).then(r => r.blob());
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload-sp2d", formData, { timeout: 300000 });
      if (res.data.success) {
        setForm(prev => ({ ...prev, ...res.data, file_dokumen: res.data.file_dokumen }));
        setEnhanced(res.data.file_dokumen);
        setAlert({ show: true, message: "OCR Berhasil! Data terisi otomatis.", type: "update" });
        setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
        setTimeLeft(180);
      }
    } catch (error) {
      setAlert({ show: true, message: "Gagal memproses dokumen.", type: "hapus" });
      setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
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
      setAlert({ show: true, message: "Gagal menyimpan ke server.", type: "hapus" });
    } finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700 pb-20">
      <style>{customCropStyles}</style>
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* --- MODAL POTONG --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col w-fit max-w-[95vw] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-white flex-shrink-0">
              <div className="flex items-center gap-2 text-left">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest leading-none ml-1">Potong Dokumen</h3>
                <button 
                  type="button"
                  onClick={() => setShowModalHint(!showModalHint)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${showModalHint ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
                >
                  <i className={`bi ${showModalHint ? 'bi-x-circle-fill' : 'bi-info-circle-fill'} text-sm`}></i>
                </button>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 text-2xl px-2 transition-colors">×</button>
            </div>
            
            {showModalHint && (
              <div className="bg-indigo-50/50 p-5 border-b border-indigo-100 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-3 text-left">
                  <i className="bi bi-lightbulb-fill text-indigo-500 text-lg mt-0.5"></i>
                  <div>
                    <p className="text-[10px] text-indigo-700 font-bold leading-tight uppercase tracking-wider">Tips Akurasi Scan:</p>
                    <p className="text-[10px] text-slate-600 leading-snug mt-1">Potong area yang berisi teks utama untuk hasil maksimal. <span className="text-amber-600 font-bold italic">Harap berikan sedikit jarak di tepi teks agar karakter tidak terpotong.</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-100 flex-1 flex justify-center items-center overflow-hidden p-4">
              <div className="relative flex justify-center items-center overflow-hidden rounded-xl">
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={(c) => setCompletedCrop(c)}>
                  <img ref={imgRef} src={imgSrc} alt="Source" onLoad={onImageLoad} style={{ maxHeight: '60vh', maxWidth: '100%', display: 'block' }} className="object-contain shadow-lg" />
                </ReactCrop>
              </div>
            </div>

            <div className="p-5 bg-white border-t flex gap-3 flex-shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Batal</button>
              <button onClick={executeCropAndUpload} className="flex-[2] bg-indigo-600 text-white py-3 rounded-2xl font-bold text-[10px] shadow-lg active:scale-95 transition-all uppercase tracking-widest">Potong & Scan Sekarang</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER AREA --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
        <div className="flex items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Input Arsip Baru</h2>
            <p className="text-xs text-slate-400 font-medium mt-1 leading-none">Lengkapi data arsip SP2D secara digital</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowMainHint(!showMainHint)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border ${showMainHint ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-400'}`}
          >
            <i className={`bi ${showMainHint ? 'bi-x-lg' : 'bi-question-lg'} text-sm`}></i>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {showMainHint && (
            <div className="bg-slate-50/80 border border-slate-100 p-4 rounded-2xl animate-in zoom-in-95 duration-300 max-w-sm xl:max-w-md text-left">
              <div className="flex gap-3">
                <i className="bi bi-info-circle-fill text-indigo-600 text-lg"></i>
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">Panduan Scan Otomatis:</span>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Unggah foto dokumen → Potong bagian isi → Tunggu proses (estimasi 1-3 menit). 
                    <span className="text-indigo-600 font-bold ml-1 italic">Mohon periksa kembali kesesuaian data sebelum melakukan penyimpanan.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <button type="button" onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-6 py-2 rounded-xl text-xs font-bold h-9 border border-slate-200/50 transition-all leading-none">
            Kembali
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        {/* KOLOM KIRI */}
        <div className="lg:col-span-5 space-y-6 lg:h-full">
          <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden text-left">
            <div className="bg-slate-50/50 p-8 rounded-[1.8rem] border border-dashed border-slate-200 group hover:border-indigo-400 transition-all cursor-pointer text-center">
              <DocumentScanner onCrop={handleSelectFile} />
            </div>
          </div>

          {(preview || enhanced) && (
            <div className="sticky top-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-2 text-center">
                <div className="relative rounded-[1.8rem] overflow-hidden bg-slate-50">
                  <img src={enhanced || preview} className="w-full h-auto" alt="Preview" />
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 text-white">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold tracking-widest uppercase">Membaca Data...</span>
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleExpire} className="w-full mt-2 py-4 text-[10px] font-bold text-slate-400 hover:text-red-600 uppercase tracking-widest transition-all rounded-xl outline-none leading-none">
                  <i className="bi bi-trash3-fill mr-1.5 text-[9px]"></i> Hapus File Cloudinary
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 space-y-8 relative">
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Informasi Utama</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Kode Klas" name="kode_klas" value={form.kode_klas} onChange={handleChange} error={errors.kode_klas} />
                <Input label="Nomor Surat" name="no_surat" value={form.no_surat} onChange={handleChange} error={errors.no_surat} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Tahun" name="tahun" value={form.tahun} onChange={handleChange} error={errors.tahun} />
                <Input label="Jumlah" name="jumlah" value={form.jumlah} onChange={handleChange} />
                <Input label="Status" name="tingkat_pengembangan" value={form.tingkat_pengembangan} onChange={handleChange} />
              </div>
              <Input label="Unit Pencipta" name="unit_pencipta" value={form.unit_pencipta} onChange={handleChange} />
              <Textarea label="Uraian Informasi (Keperluan)" name="keperluan" value={form.keperluan} onChange={handleChange} />
              <Input label="Nominal (Rp)" name="nominal" value={form.nominal} onChange={handleChange} error={errors.nominal} />
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="No Box Smt" name="no_box_sementara" value={form.no_box_sementara} onChange={handleChange} />
                <Input label="No Box Perm" name="no_box_permanen" value={form.no_box_permanen} onChange={handleChange} />
                <Select label="Kondisi" name="kondisi" value={form.kondisi} onChange={handleChange} options={['Baik', 'Rusak', 'Lembab', 'Terbakar']} />
              </div>
            </div>

            <div className="space-y-5 pt-4 border-t border-slate-50">
              <div className="grid grid-cols-2 gap-4">
                <Input label="JRA Aktif" name="jra_aktif" type="number" value={form.jra_aktif} onChange={handleChange} />
                <Input label="JRA Inaktif" name="jra_inaktif" type="number" value={form.jra_inaktif} onChange={handleChange} />
              </div>
              <Input label="Nasib Akhir" name="nasib_akhir" value={form.nasib_akhir} onChange={handleChange} />
            </div>

            <button type="submit" disabled={isSaving || loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 outline-none leading-none">
              {isSaving ? "Menyimpan ke Sistem..." : "Simpan Arsip Digital"}
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
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 leading-none">{label}</label>
    <input value={value ?? ""} {...props} className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all leading-none ${error ? 'border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-50'}`} />
    {error && <span className="text-[9px] text-red-500 font-bold ml-1 leading-none">{error[0]}</span>}
  </div>
);

const Select = ({ label, options, value, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 leading-none">{label}</label>
    <select value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all leading-none">
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const Textarea = ({ label, value, ...props }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 leading-none">{label}</label>
    <textarea value={value ?? ""} {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all min-h-[100px] resize-none leading-none" />
  </div>
);