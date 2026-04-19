import { useState, useEffect, useMemo } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import ConfirmModal from '../components/ConfirmModal';
import ExportExcel from '../components/ExportExcel';
import ImportExcel from '../components/ImportExcel'; 
import FilterSp2d from './FilterSp2d'; 

export default function DaftarSp2d({ user }) {
    const [arsip, setArsip] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState('terbaru'); 

    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [confirm, setConfirm] = useState({ show: false, id: null, noSurat: "" });

    const SLIDER_MAX = 1000000000;

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        tahun: '',
        minNominal: 0,
        maxNominal: SLIDER_MAX,
        nasib_akhir: '',
        unit_pencipta: ''
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25; 
    const navigate = useNavigate();

    const canEdit = user?.role !== 'viewer' && user?.role !== 'user';

    useEffect(() => { fetchData(true); }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, sortConfig]);

    const fetchData = async (showLoading = false) => {
        try {
            if (showLoading) setLoading(true);
            const response = await api.get('/arsip');
            const dataFinal = Array.isArray(response.data) ? response.data : response.data.data;
            setArsip(dataFinal || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDelete = (id, noSurat) => {
        setConfirm({ show: true, id, noSurat });
    };

    const handleActualDelete = async () => {
        try {
            await api.delete(`/arsip/${confirm.id}`);
            setAlert({ show: true, message: `Arsip ${confirm.noSurat} berhasil dihapus`, type: "hapus" });
            setArsip(arsip.filter(item => item.id !== confirm.id));
            setConfirm({ show: false, id: null, noSurat: "" });
        } catch {
            setAlert({ show: true, message: "Gagal menghapus data", type: "hapus" });
        }
    };

    const formatIDR = (amount) => {
        const formattedNumber = new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(amount || 0);
        return `Rp. ${formattedNumber}`;
    };

    const uniqueYears = useMemo(() => [...new Set(arsip.map(item => item.tahun).filter(Boolean))].sort((a, b) => b - a), [arsip]);
    const uniqueNasibAkhir = useMemo(() => [...new Set(arsip.map(item => item.nasib_akhir).filter(Boolean))].sort(), [arsip]);
    const uniqueUnitPencipta = useMemo(() => [...new Set(arsip.map(item => item.unit_pencipta).filter(Boolean))].sort(), [arsip]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.tahun !== '') count++;
        if (filters.nasib_akhir !== '') count++;
        if (filters.unit_pencipta !== '') count++;
        if (filters.minNominal > 0 || filters.maxNominal < SLIDER_MAX) count++;
        return count;
    }, [filters, SLIDER_MAX]);

    const filteredArsip = useMemo(() => {
        let result = arsip.filter(item => {
            const matchSearch =
                item.no_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.keperluan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.no_box_sementara?.toString().toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchYear = filters.tahun === '' || String(item.tahun) === String(filters.tahun);
            const matchNasib = filters.nasib_akhir === '' || item.nasib_akhir === filters.nasib_akhir;
            const matchUnit = filters.unit_pencipta === '' || item.unit_pencipta === filters.unit_pencipta;

            const val = Number(item.nominal) || 0;
            const matchMin = val >= Number(filters.minNominal);
            const matchMax = val <= Number(filters.maxNominal);

            return matchSearch && matchYear && matchNasib && matchUnit && matchMin && matchMax;
        });

        return result.sort((a, b) => {
            if (sortConfig === 'terbaru') return new Date(b.created_at) - new Date(a.created_at);
            if (sortConfig === 'terlama') return new Date(a.created_at) - new Date(b.created_at);
            if (sortConfig === 'asc') return (Number(a.nominal) || 0) - (Number(b.nominal) || 0);
            if (sortConfig === 'desc') return (Number(b.nominal) || 0) - (Number(a.nominal) || 0);
            return 0;
        });
    }, [arsip, searchTerm, filters, sortConfig]);

    const totalPages = Math.ceil(filteredArsip.length / itemsPerPage);
    const currentArsip = filteredArsip.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        let startPage = Math.max(1, currentPage - 4);
        let endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) startPage = Math.max(1, endPage - 9);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    return (
        <div className="space-y-6 relative">
            {alert.show && (
                <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />
            )}

            <ConfirmModal
                show={confirm.show}
                type="hapus"
                message={`Hapus dokumen SP2D ${confirm.noSurat}?`}
                onConfirm={handleActualDelete}
                onCancel={() => setConfirm({ show: false, id: null, noSurat: "" })}
            />

            <FilterSp2d 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                currentFilters={filters}
                onApply={(newFilters) => setFilters(newFilters)}
                uniqueYears={uniqueYears}
                uniqueNasibAkhir={uniqueNasibAkhir}
                uniqueUnitPencipta={uniqueUnitPencipta}
                sliderMax={SLIDER_MAX}
            />

            <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden font-sans text-left">
                
                <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="text-left shrink-0">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase leading-none">Daftar Dokumen SP2D</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Total {filteredArsip.length} data terintegrasi</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-end">
                        <div className="relative w-full sm:w-[300px]"> 
                            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"></i>
                            <input
                                type="text"
                                placeholder="Cari dokumen..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm outline-none focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-400"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                            <div className="relative">
                                <select 
                                    value={sortConfig}
                                    onChange={(e) => setSortConfig(e.target.value)}
                                    className="w-11 h-11 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-all text-slate-700 text-[0px]"
                                    title="Urutkan Data"
                                >
                                    <option value="terbaru" className="text-sm">Terbaru</option>
                                    <option value="terlama" className="text-sm">Terlama</option>
                                    <option value="desc" className="text-sm">Nominal Terbesar</option>
                                    <option value="asc" className="text-sm">Nominal Terkecil</option>
                                </select>
                                <i className="bi bi-sort-down absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-lg"></i>
                            </div>

                            <button 
                                onClick={() => setIsFilterModalOpen(true)}
                                className={`w-11 h-11 flex items-center justify-center border rounded-2xl transition-all shadow-sm outline-none relative ${
                                    activeFilterCount > 0 
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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

                            {canEdit && <ImportExcel onRefresh={() => fetchData(true)} setAlert={setAlert} />}
                            <ExportExcel data={filteredArsip} />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5 w-[25%]">Informasi Dokumen</th>
                                <th className="px-8 py-5 w-[25%]">Uraian / Keperluan</th>
                                <th className="px-8 py-5 w-[15%] text-center">No. Box</th>
                                <th className="px-8 py-5 w-[20%] text-center">Nominal</th>
                                <th className="px-8 py-5 w-[15%] text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && arsip.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-300 animate-pulse font-medium italic">Sinkronisasi data arsip...</td>
                                </tr>
                            ) : arsip.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                <i className="bi bi-file-earmark-plus text-4xl text-slate-200"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500 font-bold text-lg">Belum Ada Data Arsip</p>
                                                <p className="text-slate-400 text-xs italic">Silakan gunakan fitur Import Excel.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredArsip.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                                                <i className="bi bi-search text-3xl text-indigo-300"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500 font-bold text-lg">Dokumen Tidak Ditemukan</p>
                                                <p className="text-slate-400 text-xs italic">Kata kunci "{searchTerm}" tidak cocok.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentArsip.map(item => ( 
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    <i className="bi bi-file-earmark-text text-lg"></i>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors break-words">{item.no_surat}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Thn: {item.tahun || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        {/* 🔥 BAGIAN PERBAIKAN: Keperluan melebar ke bawah (whitespace-normal) */}
                                        <td className="px-8 py-6 align-top">
                                            <div className="text-xs text-slate-500 leading-relaxed whitespace-normal break-words py-1">
                                                {item.keperluan || '-'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center text-xs">
                                            <span className="inline-block bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 font-bold uppercase tracking-tight">
                                                {item.no_box_sementara || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center whitespace-nowrap">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full tracking-tighter border border-indigo-100">
                                                {formatIDR(item.nominal)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => navigate(`/show-arsip/${item.id}`)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm outline-none" title="Lihat Detail">
                                                    <i className="bi bi-eye text-base"></i>
                                                </button>
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => navigate(`/edit-arsip/${item.id}`)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm outline-none" title="Edit Data">
                                                            <i className="bi bi-pencil-square text-base"></i>
                                                        </button>
                                                        <button onClick={() => handleOpenDelete(item.id, item.no_surat)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm outline-none" title="Hapus Data">
                                                            <i className="bi bi-trash text-base"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 0 && !loading && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
                            Menampilkan {filteredArsip.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredArsip.length)} dari {filteredArsip.length} data
                        </span>
                        
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm">
                                <i className="bi bi-chevron-double-left text-[10px]"></i>
                            </button>
                            {getPageNumbers().map(num => (
                                <button key={num} onClick={() => setCurrentPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === num ? 'bg-indigo-600 text-white border-none shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm">
                                <i className="bi bi-chevron-double-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}