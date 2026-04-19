import { useState, useEffect } from 'react';
import api from '../services/api';
import UserList from '../components/UserList';
import AddUserModal from '../components/AddUserModal';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [confirm, setConfirm] = useState({ show: false, id: null, name: "" });

    useEffect(() => { fetchUsers(); }, []);

    // Alert otomatis hilang dalam 4 detik
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert({ ...alert, show: false });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) { console.error(err); } 
        finally { setIsLoading(false); }
    };

    const handleOpenDelete = (id, name) => setConfirm({ show: true, id, name });

    const handleActualDelete = async () => {
        try {
            await api.delete(`/users/${confirm.id}`);
            setAlert({ show: true, message: `Berhasil! Akun ${confirm.name} telah dihapus.`, type: "hapus" });
            fetchUsers();
        } catch (err) { 
            setAlert({ show: true, message: "Gagal menghapus data pegawai.", type: "hapus" }); 
        } finally { 
            setConfirm({ ...confirm, show: false }); 
        }
    };

    return (
        <div className="space-y-6 relative">
            
            {/* NOTIFIKASI POJOK KANAN (DI ATAS BLUR MODAL) */}
            {alert.show && (
                <div className="fixed top-10 right-10 z-[10001] w-full max-w-sm animate-in slide-in-from-right-10 duration-300">
                    <Alert 
                        message={alert.message} 
                        type={alert.type} 
                        onClose={() => setAlert({ ...alert, show: false })} 
                    />
                </div>
            )}

            <ConfirmModal 
                show={confirm.show} 
                type="hapus" 
                message={`Hapus akun pegawai ${confirm.name}?`} 
                onConfirm={handleActualDelete} 
                onCancel={() => setConfirm({ ...confirm, show: false })} 
            />

            {/* HEADER AREA */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">Kelola Pegawai</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Manajemen hak akses pengelola dokumen digital</p>
                </div>
                {/* 🔥 Shadow sudah dihilangkan di sini */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all active:scale-95"
                >
                    + Tambah Pegawai
                </button>
            </div>

            {/* LIST PEGAWAI */}
            <UserList 
                users={users} 
                isLoading={isLoading} 
                onDelete={handleOpenDelete} 
                onRefresh={fetchUsers} 
                setAlert={setAlert} 
            />

            {/* MODAL TAMBAH */}
            {isModalOpen && (
                <AddUserModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => { 
                        setIsModalOpen(false); 
                        fetchUsers(); 
                    }} 
                    setAlert={setAlert} 
                />
            )}
        </div>
    );
}