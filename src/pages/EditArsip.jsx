import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

export default function EditArsip() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    kode_klas: "",
    no_surat: "",
    keperluan: "",
    unit_pencipta: "",
    tahun: "",
    jumlah: "",
    nominal: "",
    no_box_sementara: "",
    tingkat_pengembangan: "",
    no_box_permanen: "",
    kondisi: "",
    jra_aktif: "",
    jra_inaktif: "",
    nasib_akhir: "",
    rekomendasi: "",
    keterangan: "",
    terlampir: "",
    file_dokumen: ""
  });

  // Ambil data arsip berdasarkan ID
  useEffect(() => {
    const fetchArsip = async () => {
      try {
        const res = await api.get(`/arsip/${id}`);
        if (res.data.success) {
          setForm(res.data.data);
        }
      } catch (error) {
        setAlert({ show: true, message: "Gagal memuat data arsip.", type: "hapus" });
      } finally {
        setLoading(false);
      }
    };
    fetchArsip();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      const res = await api.put(`/arsip/${id}`, form);
      if (res.data.success) {
        setAlert({ show: true, message: "Perubahan Berhasil Disimpan!", type: "update" });
        setTimeout(() => navigate('/arsip'), 2000);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setAlert({ show: true, message: "Validasi Gagal. Cek isian merah.", type: "hapus" });
      } else {
        setAlert({ show: true, message: "Gagal menyimpan perubahan.", type: "hapus" });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 fade-in duration-500 mt-6 font-sans text-slate-700">
      
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none ">Edit Data Arsip</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Perbarui informasi detail dokumen SP2D</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="bg-slate-100 text-slate-500 hover:bg-slate-200 px-6 py-2 rounded-xl text-xs font-bold transition-all h-9 shadow-sm">
          Kembali
        </button>
      </div>

      {/* FORM AREA - FULL WIDTH */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Dokumen Terlampir" name="terlampir" value={form.terlampir} onChange={handleChange} error={errors.terlampir} />
            <Input label="Nominal (Rp)" name="nominal" value={form.nominal} onChange={handleChange} error={errors.nominal} />
          </div>
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
          disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 outline-none"
        >
          {isSaving ? "Menyimpan Perubahan..." : "Update Data Arsip"}
        </button>
      </form>
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