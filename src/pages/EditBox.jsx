import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Alert from "../components/Alert";

export default function EditBox() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nomor_box: '',
    tahun: '',
    kode_klasifikasi: '',
    nama_rak: '',
    nomor_rak: '',
    keterangan: ''
  });

  useEffect(() => {
    const fetchDetailBox = async () => {
      try {
        const res = await api.get(`/boxes/${id}`);
        const data = res.data; 
        
        setForm({
          nomor_box: data.nomor_box || '',
          tahun: data.tahun || '',
          kode_klasifikasi: data.kode_klasifikasi || '',
          nama_rak: data.nama_rak || '',
          nomor_rak: data.nomor_rak || '',
          keterangan: data.keterangan || ''
        });
      } catch (error) {
        setAlert({ show: true, message: "Gagal menarik data box dari server.", type: "hapus" });
      } finally {
        setLoading(false);
      }
    };
    fetchDetailBox();
  }, [id]);

  const handleChange = (e) => {
      let { name, value } = e.target;

      // AUTO-FORMAT: NAMA RAK (Hanya 1 Huruf & Otomatis Kapital)
      if (name === "nama_rak") {
          value = value.replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase();
      }
      
      // AUTO-FORMAT: NOMOR RAK (Hanya Angka & Hilangkan Nol di depan)
      if (name === "nomor_rak") {
          value = value.replace(/\D/g, '').replace(/^0+/, '');
      }

      setForm({ ...form, [name]: value });
      
      if (errors[name]) {
          setErrors({ ...errors, [name]: null });
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({}); 
    
    try {
      const res = await api.put(`/boxes/${id}`, form);
      if (res.status === 200 || res.data.success) {
        setAlert({ show: true, message: "Perubahan Data Box Berhasil Disimpan!", type: "simpan" });
        setTimeout(() => navigate('/boxes'), 1500);
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
          setErrors(error.response.data.errors);
          setAlert({ show: true, message: "Ada isian yang salah. Cek kotak merah di bawah!", type: "hapus" });
      } else {
          setAlert({ show: true, message: "Gagal menyimpan perubahan ke server.", type: "hapus" });
      }
    } finally { 
        setIsSaving(false); 
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700">
      {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}
      
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
        <div className="text-left w-full md:w-auto">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Edit Box</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Perbaharui detail identitas box arsip</p>
        </div>
          <button 
              type="button"
              onClick={() => navigate('/boxes')}
              className="w-full md:w-auto bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
          >
              Kembali
          </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8 text-left">
          
          <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Box</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 🔥 required dihapus */}
                  <Input label="Nomor Box" name="nomor_box" value={form.nomor_box} onChange={handleChange} error={errors.nomor_box} placeholder="Contoh: B-01" />
                  <Input label="Tahun" name="tahun" value={form.tahun} onChange={handleChange} error={errors.tahun} type="number" placeholder="Contoh: 2024" />
                  <Input label="Klasifikasi" name="kode_klasifikasi" value={form.kode_klasifikasi} onChange={handleChange} error={errors.kode_klasifikasi} placeholder="Contoh: BPA" />
              </div>
          </div>

          <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lokasi & Catatan</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 🔥 required dihapus */}
                  <Input label="Nama Rak (Zona)" name="nama_rak" value={form.nama_rak} onChange={handleChange} error={errors.nama_rak} placeholder="A" />
                  <Input label="Nomor Rak (Urutan)" name="nomor_rak" value={form.nomor_rak} onChange={handleChange} error={errors.nomor_rak} placeholder="1" />
              </div>
              
              <Textarea label="Keterangan / Catatan Tambahan" name="keterangan" value={form.keterangan} onChange={handleChange} error={errors.keterangan} placeholder="Tuliskan catatan fisik box atau keterangan khusus jika ada..." />
          </div>

          <button 
              type="submit" 
              disabled={isSaving || loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? "Menyimpan Perubahan..." : "Simpan Perubahan Box"}
          </button>
        </form>
      </div>
    </div>
  );
}

const Input = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      value={value ?? ""} 
      {...props} 
      className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all placeholder:text-slate-300 ${
        error ? 'border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-100'
      }`} 
    />
    {error && <span className="text-[10px] text-red-500 font-bold ml-1">{error[0]}</span>}
  </div>
);

const Textarea = ({ label, value, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <textarea 
      value={value ?? ""} 
      {...props} 
      rows="3"
      className={`w-full bg-slate-50/50 border rounded-xl px-4 py-3 text-sm focus:bg-white outline-none transition-all placeholder:text-slate-300 resize-none ${
        error ? 'border-red-400 focus:ring-1 focus:ring-red-400 bg-red-50/30' : 'border-slate-100 focus:ring-1 focus:ring-indigo-100'
      }`} 
    />
    {error && <span className="text-[10px] text-red-500 font-bold ml-1">{error[0]}</span>}
  </div>
);