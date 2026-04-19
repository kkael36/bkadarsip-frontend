import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';

export default function AddBox() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [formData, setFormData] = useState({
        nomor_box: '',
        tahun: '',
        kode_klasifikasi: '',
        nama_rak: '',
        nomor_rak: '',
        keterangan: ''
    });

    const handleChange = (e) => {
        let { name, value } = e.target;

        // 🔥 AUTO-FORMAT: NAMA RAK (Hanya 1 Huruf & Otomatis Kapital)
        if (name === "nama_rak") {
            value = value.replace(/[^a-zA-Z]/g, '').substring(0, 1).toUpperCase();
        }
        
        // 🔥 AUTO-FORMAT: NOMOR RAK (Hanya Angka & Hilangkan Nol di depan)
        if (name === "nomor_rak") {
            value = value.replace(/\D/g, '').replace(/^0+/, '');
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/boxes', formData);
            setAlert({ show: true, message: "Data box berhasil ditambahkan!", type: "simpan" });
            
            setTimeout(() => {
                navigate('/boxes');
            }, 1500);
        } catch (err) {
            console.error(err);
            setAlert({ show: true, message: "Gagal menambah data box.", type: "hapus" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700">
            
            {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Tambah Box</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Masukkan detail identitas box arsip baru</p>
                </div>
                <button 
                    onClick={() => navigate('/boxes')}
                    className="w-full md:w-auto bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                    Kembali
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm p-8 space-y-8 text-left">
                
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Box</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Nomor Box" name="nomor_box" value={formData.nomor_box} onChange={handleChange} required placeholder="Contoh: B-01" />
                        <Input label="Tahun" name="tahun" value={formData.tahun} onChange={handleChange} type="number" placeholder="Contoh: 2024" />
                        <Input label="Klasifikasi" name="kode_klasifikasi" value={formData.kode_klasifikasi} onChange={handleChange} placeholder="Contoh: BPA" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Lokasi & Catatan</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Nama Rak (Zona)" name="nama_rak" value={formData.nama_rak} onChange={handleChange} required placeholder="A" />
                        <Input label="Nomor Rak (Urutan)" name="nomor_rak" value={formData.nomor_rak} onChange={handleChange} required placeholder="1" />
                    </div>
                    
                    <Textarea label="Keterangan / Catatan Tambahan" name="keterangan" value={formData.keterangan} onChange={handleChange} placeholder="Tuliskan catatan fisik box atau keterangan khusus jika ada..." />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? "Menyimpan ke Database..." : "Simpan Data Box"}
                </button>
            </form>
        </div>
    );
}

const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <input {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" />
    </div>
);

const Textarea = ({ label, ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <textarea {...props} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all min-h-[100px] placeholder:text-slate-300 resize-none" />
    </div>
);