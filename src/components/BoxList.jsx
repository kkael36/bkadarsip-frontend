import { useState, useMemo, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import ExportExcelBox from './ExportExcelBox';
import ImportBoxExcel from './ImportBoxExcel'; 
import FilterBox from './FilterBox'; 
import Alert from './Alert'; 

export default function BoxList({ boxes, isLoading, onDelete, onEdit, setAlert, onRefresh, alert }) {
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const SLIDER_MAX = 1000;

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState('terbaru'); 
    const [filters, setFilters] = useState({
        tahun: '',
        kode_klasifikasi: '',
        nama_rak: '',
        minRak: 0,
        maxRak: SLIDER_MAX
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, filters, sortConfig]);

    const uniqueYears = useMemo(() => {
        if (!boxes) return [];
        return [...new Set(boxes.map(b => b.tahun).filter(Boolean))].sort((a, b) => b - a);
    }, [boxes]);

    const uniqueKlasifikasi = useMemo(() => {
        if (!boxes) return [];
        return [...new Set(boxes.map(b => b.kode_klasifikasi).filter(Boolean))].sort();
    }, [boxes]);

    const uniqueNamaRak = useMemo(() => {
        if (!boxes) return [];
        return [...new Set(boxes.map(b => b.nama_rak).filter(Boolean))].sort();
    }, [boxes]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.tahun !== '') count++;
        if (filters.kode_klasifikasi !== '') count++;
        if (filters.nama_rak !== '') count++;
        if (filters.minRak > 0 || filters.maxRak < SLIDER_MAX) count++;
        return count;
    }, [filters, SLIDER_MAX]);

    const filteredBoxes = useMemo(() => {
        let result = boxes.filter(b => {
            const matchSearch = (
                b.nomor_box?.toLowerCase().includes(search.toLowerCase()) || 
                b.kode_klasifikasi?.toLowerCase().includes(search.toLowerCase()) ||
                b.nama_rak?.toLowerCase().includes(search.toLowerCase()) ||
                b.nomor_rak?.toLowerCase().includes(search.toLowerCase()) ||
                b.keterangan?.toLowerCase().includes(search.toLowerCase())
            );

            const matchYear = filters.tahun === '' || String(b.tahun) === String(filters.tahun);
            const matchKlasifikasi = filters.kode_klasifikasi === '' || b.kode_klasifikasi === filters.kode_klasifikasi;
            const matchNamaRak = filters.nama_rak === '' || b.nama_rak === filters.nama_rak;
            
            const valRak = Number(b.nomor_rak) || 0;
            const matchMin = valRak >= Number(filters.minRak);
            const matchMax = valRak <= Number(filters.maxRak);

            return matchSearch && matchYear && matchKlasifikasi && matchNamaRak && matchMin && matchMax;
        });

        return result.sort((a, b) => {
            if (sortConfig === 'terbaru') return new Date(b.created_at) - new Date(a.created_at);
            if (sortConfig === 'terlama') return new Date(a.created_at) - new Date(b.created_at);
            if (sortConfig === 'box_asc') return (a.nomor_box || '').localeCompare(b.nomor_box || '', undefined, {numeric: true});
            if (sortConfig === 'rak_asc') return (Number(a.nomor_rak) || 0) - (Number(b.nomor_rak) || 0);
            return 0;
        });
    }, [boxes, search, filters, sortConfig]);

    const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
    const currentBoxes = filteredBoxes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        let startPage = Math.max(1, currentPage - 4);
        let endPage = Math.min(totalPages, startPage + 9);
        if (endPage - startPage < 9) startPage = Math.max(1, endPage - 9);
        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    const canEdit = user?.role !== 'viewer' && user?.role !== 'user';

    return (
        <div className="space-y-4">
            {alert?.show && (
                <Alert 
                    message={alert.message} 
                    type={alert.type} 
                    onClose={() => setAlert({ ...alert, show: false })} 
                />
            )}

            <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden font-sans text-left relative">
                
                <FilterBox 
                    isOpen={isFilterModalOpen}
                    onClose={() => setIsFilterModalOpen(false)}
                    currentFilters={filters}
                    onApply={(newFilters) => setFilters(newFilters)}
                    uniqueYears={uniqueYears}
                    uniqueKlasifikasi={uniqueKlasifikasi}
                    uniqueNamaRak={uniqueNamaRak}
                    sliderMax={SLIDER_MAX}
                />

                <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="text-left shrink-0">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase leading-none">Daftar Box Fisik</h2>
                        <p className="text-xs text-slate-400 font-medium mt-1">Total {filteredBoxes.length} box terintegrasi dalam sistem</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto justify-end">
                        <div className="relative w-full sm:w-[300px]">
                            <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold"></i>
                            <input 
                                type="text" 
                                placeholder="Cari no. box, rak, keterangan..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-2xl text-sm shadow-sm outline-none focus:ring-1 focus:ring-indigo-100 placeholder:text-slate-400" 
                                onChange={(e) => setSearch(e.target.value)} 
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
                                    <option value="box_asc" className="text-sm">No. Box (A-Z)</option>
                                    <option value="rak_asc" className="text-sm">No. Rak (Kecil-Besar)</option>
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

                            {canEdit && (
                                <ImportBoxExcel onRefresh={onRefresh} setAlert={setAlert} />
                            )}
                            <ExportExcelBox data={filteredBoxes} />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                        <thead>
                            <tr className="border-b border-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5 w-[25%]">Identitas Box</th>
                                <th className="px-8 py-5 w-[20%]">Klasifikasi</th>
                                <th className="px-8 py-5 w-[20%]">Posisi Rak</th>
                                <th className="px-8 py-5 w-[20%] text-center">Keterangan</th>
                                <th className="px-8 py-5 w-[15%] text-right">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {/* 1. LOADING STATE */}
                            {isLoading && boxes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-300 animate-pulse font-medium italic">
                                        Sinkronisasi data...
                                    </td>
                                </tr>
                            ) : boxes.length === 0 ? (
                                /* 2. DATABASE KOSONG STATE */
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                                <i className="bi bi-archive text-4xl text-slate-200"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500 font-bold text-lg">Belum Ada Data Box</p>
                                                <p className="text-slate-400 text-xs italic">Silakan tambahkan data baru atau gunakan fitur Import Excel.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredBoxes.length === 0 ? (
                                /* 3. HASIL CARI/FILTER TIDAK ADA STATE */
                                <tr>
                                    <td colSpan="5" className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                                                <i className="bi bi-search text-3xl text-indigo-300"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500 font-bold text-lg">Pencarian Tidak Ditemukan</p>
                                                <p className="text-slate-400 text-xs italic">Kata kunci "{search}" tidak cocok dengan data apapun.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                /* 4. DATA STATE */
                                currentBoxes.map(box => ( 
                                    <tr key={box.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                                                    <i className="bi bi-archive text-lg"></i>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors break-words">{box.nomor_box}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Thn: {box.tahun || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-widest truncate">
                                                {box.kode_klasifikasi || '-'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-tighter border border-indigo-100 whitespace-nowrap text-center block">
                                                RAK {box.nama_rak} / {box.nomor_rak}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-xs text-slate-500 text-center">
                                            <div className="max-w-[200px] italic whitespace-normal break-words leading-relaxed mx-auto">
                                                {box.keterangan || <span className="text-slate-300">Tidak ada catatan</span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => navigate(`/show-box/${box.id}`)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-indigo-600 hover:text-white rounded-lg transition-all shadow-sm" title="Lihat Detail"><i className="bi bi-eye text-base"></i></button>
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => onEdit(box.id)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm" title="Edit Data"><i className="bi bi-pencil-square text-base"></i></button>
                                                        <button onClick={() => onDelete(box.id, box.nomor_box)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm" title="Hapus Data"><i className="bi bi-trash text-base"></i></button>
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

                {totalPages > 0 && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBoxes.length)} dari {filteredBoxes.length} data</span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm"><i className="bi bi-chevron-double-left text-[10px]"></i></button>
                            {getPageNumbers().map(num => (
                                <button key={num} onClick={() => setCurrentPage(num)} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm ${currentPage === num ? 'bg-indigo-600 text-white border-none shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{num}</button>
                            ))}
                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition-all shadow-sm"><i className="bi bi-chevron-double-right text-[10px]"></i></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}