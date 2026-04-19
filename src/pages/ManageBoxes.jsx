import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BoxList from '../components/BoxList';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

export default function ManageBoxes() {
    const { user } = useAuth();
    const [boxes, setBoxes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [confirm, setConfirm] = useState({ show: false, id: null, name: "" });

    const navigate = useNavigate();

    useEffect(() => {
        // Loading muncul pas pertama kali buka halaman
        fetchBoxes(true);
    }, []);

    /**
     * @param {boolean} showLoading - Kontrol apakah animasi sinkronisasi muncul atau engga
     */
    const fetchBoxes = async (showLoading = false) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await api.get('/boxes');
            setBoxes(response.data);
        } catch (err) {
            console.error("Gagal muat data:", err);
            setAlert({ show: true, message: "Koneksi ke server terputus", type: "hapus" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleActualDelete = async () => {
        try {
            await api.delete(`/boxes/${confirm.id}`);
            setAlert({ show: true, message: `Data box ${confirm.name} berhasil dihapus`, type: "hapus" });
            
            // 🔥 HAPUS: Kita set false biar datanya ilang secara halus (tanpa loading sinkronisasi)
            fetchBoxes(false); 
        } catch (err) {
            setAlert({ show: true, message: "Gagal menghapus data", type: "hapus" });
        } finally {
            setConfirm({ show: false, id: null, name: "" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {alert.show && (
                <Alert 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert({ ...alert, show: false })} 
                />
            )}

            <ConfirmModal 
                show={confirm.show}
                type="hapus"
                message={`Hapus data box ${confirm.name}?`}
                onConfirm={handleActualDelete}
                onCancel={() => setConfirm({ show: false, id: null, name: "" })}
            />

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">Kelola Rak dan Box</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Data lokasi penyimpanan box terintegrasi</p>
                </div>
                
                {(user?.role === 'super_admin' || user?.role === 'operator') && (
                    <button 
                        onClick={() => navigate('/add-box')}
                        className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                    >
                        + Tambah Box
                    </button>
                )}
            </div>

            <BoxList 
                boxes={boxes} 
                isLoading={isLoading} 
                // 🔥 IMPORT & REFRESH: Kita set true biar muncul loading sinkronisasi pas beres upload!
                onRefresh={() => fetchBoxes(true)} 
                setAlert={setAlert}   
                onDelete={(id, name) => setConfirm({ show: true, id, name })}
                onEdit={(id) => navigate(`/edit-box/${id}`)}
            />
        </div>
    );
}