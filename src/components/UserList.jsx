import { useState, useMemo } from 'react';
import api from '../services/api';
import ConfirmModal from './ConfirmModal';
import FilterUser from './FilterUser'; 

export default function UserList({ users, isLoading, onDelete, onRefresh, setAlert }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [modalType, setModalType] = useState(null); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [customDate, setCustomDate] = useState('');
    const [statusConfirm, setStatusConfirm] = useState({ show: false, duration: null, type: 'update' });
    
    // State Filter & Sort
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState('name_asc');
    const [filters, setFilters] = useState({ role: '', status: '' });

    const triggerStatusConfirm = (duration, type = 'update') => {
        setStatusConfirm({ show: true, duration, type });
    };

    const handleRoleUpdate = async (newRole) => {
        try {
            await api.post(`/users/${selectedUser.id}/role`, { role: newRole });
            setAlert({ show: true, message: "Hak akses berhasil diperbarui!", type: "update" });
            onRefresh(); 
            setModalType(null);
        } catch (err) {
            setAlert({ show: true, message: "Gagal memperbarui akses", type: "hapus" });
        }
    };

    const getRemainingTimeText = (dateString) => {
        if (!dateString) return null;
        const targetDate = Date.parse(dateString);
        const total = targetDate - Date.parse(new Date());
        if (total <= 0) return "Segera Berakhir";
        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        if (days > 365) return "SELAMANYA";
        return days > 0 ? `${days} HARI ${hours} JAM` : `${hours} JAM LAGI`;
    };

    const isForeverActive = (dateString) => {
        if (!dateString) return false;
        const days = Math.floor((Date.parse(dateString) - Date.parse(new Date())) / (1000 * 60 * 60 * 24));
        return days > 365;
    };

    const handleExecuteStatus = async () => {
        try {
            const duration = statusConfirm.duration;
            const res = await api.post(`/users/${selectedUser.id}/status`, { 
                duration: duration, 
                custom_date: customDate 
            });
            setAlert({ show: true, message: res.data.message, type: statusConfirm.type === 'simpan' ? 'simpan' : 'hapus' });
            onRefresh();
        } catch (err) {
            setAlert({ show: true, message: "Gagal memproses", type: "hapus" });
        } finally {
            setStatusConfirm({ show: false, duration: null });
            setModalType(null);
            setCustomDate('');
        }
    };

    // LOGIKA FILTERING & SORTING
    const filteredUsers = useMemo(() => {
        let result = users.filter(u => {
            const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchRole = filters.role === '' || u.role === filters.role;
            const matchStatus = filters.status === '' || 
                               (filters.status === 'aktif' ? u.is_active : !u.is_active);
            
            return matchSearch && matchRole && matchStatus;
        });

        return result.sort((a, b) => {
            if (sortConfig === 'name_asc') return a.name.localeCompare(b.name);
            if (sortConfig === 'name_desc') return b.name.localeCompare(a.name);
            if (sortConfig === 'email_asc') return a.email.localeCompare(b.email);
            if (sortConfig === 'role_asc') return a.role.localeCompare(b.role);
            return 0;
        });
    }, [users, searchTerm, filters, sortConfig]);

    const activeFilterCount = (filters.role !== '' ? 1 : 0) + (filters.status !== '' ? 1 : 0);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden font-sans text-left relative">
            <ConfirmModal 
                show={statusConfirm.show}
                type={statusConfirm.type}
                message={statusConfirm.duration === null ? `Aktifkan akun ${selectedUser?.name}?` : `Konfirmasi status akun ${selectedUser?.name}?`}
                onConfirm={handleExecuteStatus}
                onCancel={() => setStatusConfirm({ ...statusConfirm, show: false })}
            />

            <FilterUser 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApply={(newFilters) => setFilters(newFilters)}
            />

            {/* HEADER AREA */}
            <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col xl:flex-row justify-between items-center gap-4">
                <div className="text-left w-full xl:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">Daftar Pegawai</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Ditemukan {filteredUsers.length} pengelola arsip</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="relative w-full sm:w-auto flex-1 min-w-[250px]">
                        <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold"></i>
                        <input 
                            type="text" 
                            placeholder="Cari nama atau email..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm outline-none focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-400" 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>

                    {/* Dropdown Sorting */}
                    <div className="relative">
                        <select 
                            value={sortConfig}
                            onChange={(e) => setSortConfig(e.target.value)}
                            className="w-11 h-11 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-all text-transparent"
                            title="Urutkan Data"
                        >
                            <option value="name_asc" className="text-slate-700">Nama (A-Z)</option>
                            <option value="name_desc" className="text-slate-700">Nama (Z-A)</option>
                            <option value="email_asc" className="text-slate-700">Email (A-Z)</option>
                            <option value="role_asc" className="text-slate-700">Hak Akses</option>
                        </select>
                        <i className="bi bi-sort-down absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg"></i>
                    </div>

                    {/* Tombol Filter */}
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className={`w-11 h-11 flex items-center justify-center border rounded-2xl transition-all shadow-sm outline-none relative ${
                            activeFilterCount > 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Filter Data"
                    >
                        <i className="bi bi-funnel text-lg"></i> 
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center bg-indigo-600 text-white w-5 h-5 rounded-full text-[10px] font-black border-2 border-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Pegawai</th>
                            <th className="px-8 py-5 text-center">Akses</th>
                            <th className="px-8 py-5 text-center">Status</th>
                            <th className="px-8 py-5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan="4" className="p-20 text-center text-slate-300 animate-pulse font-medium italic">Menyinkronkan data...</td>
                            </tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.id} className={`hover:bg-slate-50/50 group transition-all ${!u.is_active ? 'bg-slate-50/20' : ''}`}>
                                <td className="px-8 py-6 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm italic flex-shrink-0">
                                        {u.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">{u.name}</span>
                                        <span className="text-[10px] text-slate-400 font-medium lowercase truncate">{u.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <button 
                                        onClick={() => { setSelectedUser(u); setModalType('role'); }} 
                                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                    >
                                        {u.role.replace('_', ' ')}
                                    </button>
                                </td>
                                <td className="px-8 py-6 text-center text-[10px] font-bold uppercase">
                                    {u.is_active ? <span className="text-green-500">● Aktif</span> : <span className="text-red-400">● Nonaktif</span>}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    {/* Tombol Aksi dibuat selalu terlihat */}
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => { setSelectedUser(u); setModalType('status_menu'); }} 
                                            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Keamanan & Status"
                                        >
                                            <i className="bi bi-shield-lock text-lg"></i>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(u.id, u.name)} 
                                            className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Hapus Pegawai"
                                        >
                                            <i className="bi bi-trash text-lg"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isLoading && filteredUsers.length === 0 && (
                    <div className="p-20 text-center flex flex-col items-center justify-center">
                        <i className="bi bi-people text-5xl text-slate-200 mb-4 block"></i>
                        <h3 className="text-slate-600 font-bold text-sm">Pegawai tidak ditemukan</h3>
                    </div>
                )}
            </div>

            {/* MODAL STATUS */}
            {modalType === 'status_menu' && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
                    <div className="bg-white w-full max-w-[320px] rounded-[2rem] p-6 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-5">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">Status Akun</span>
                            <h3 className="text-xs font-bold text-slate-700 truncate px-4">{selectedUser.name}</h3>
                        </div>

                        {!selectedUser.is_active && (
                            <div className="mb-5 p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                                <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest block mb-1">
                                    {isForeverActive(selectedUser.deactivated_until) ? 'STATUS AKUN:' : 'SISA WAKTU:'}
                                </span>
                                <span className="text-lg font-black text-red-600 tracking-tighter uppercase">
                                    {getRemainingTimeText(selectedUser.deactivated_until)}
                                </span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {!isForeverActive(selectedUser.deactivated_until) && (
                                <div className="grid grid-cols-2 gap-2">
                                    {[{l:'1 Hari',v:'1_day'}, {l:'1 Minggu',v:'1_week'}, {l:'1 Bulan',v:'1_month'}, {l:'Selamanya',v:'forever'}].map(opt => (
                                        <button key={opt.v} onClick={() => triggerStatusConfirm(opt.v, 'hapus')} className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[9px] font-bold uppercase transition-all">
                                            {opt.l}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {!selectedUser.is_active && (
                                <button onClick={() => triggerStatusConfirm(null, 'simpan')} className="w-full py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md">
                                    Aktifkan Akun
                                </button>
                            )}
                            <div className="pt-4 border-t border-slate-50 text-left">
                                <span className="text-[9px] font-bold text-slate-300 uppercase block mb-2 ml-1">Set Tanggal Manual</span>
                                <input type="date" className="w-full px-4 py-2 bg-slate-50 rounded-xl text-xs outline-none mb-2 border border-transparent focus:border-slate-200" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
                                <button disabled={!customDate} onClick={() => triggerStatusConfirm('custom', 'hapus')} className="w-full py-2 bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-20 transition-all">
                                    Update Tanggal
                                </button>
                            </div>
                        </div>
                        <button onClick={() => setModalType(null)} className="w-full mt-6 py-2 bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl text-[9px] font-bold uppercase transition-all">Tutup</button>
                    </div>
                </div>
            )}

            {/* MODAL ROLE */}
            {modalType === 'role' && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/10 backdrop-blur-[2px]">
                    <div className="bg-white w-full max-w-[280px] rounded-[2rem] p-6 shadow-2xl border border-slate-50 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mb-5">Pilih Hak Akses</h3>
                        <div className="space-y-1.5">
                            {['super_admin', 'operator', 'viewer'].map(r => (
                                <button key={r} onClick={() => handleRoleUpdate(r)} className={`w-full py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${selectedUser.role === r ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}>
                                    {r.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setModalType(null)} className="w-full mt-5 py-2 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-bold uppercase">Batal</button>
                    </div>
                </div>
            )}
        </div>
    );
}