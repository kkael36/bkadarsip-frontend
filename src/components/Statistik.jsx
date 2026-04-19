import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LabelList // 🔥 Import LabelList untuk menampilkan angka di grafik
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ExportPdfDashboard from './ExportPdfDashboard';
import FilterStatistik from '../components/FilterStatistik';

export default function Statistik() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth(); 

    const [rawArsip, setRawArsip] = useState([]);
    const [rawBoxes, setRawBoxes] = useState([]);
    const [pegawaiCount, setPegawaiCount] = useState('-');
    const [availableUploadYears, setAvailableUploadYears] = useState([]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        timeFilter: 'semua',
        monthStart: '',
        monthEnd: '',
        year: ''
    });

    const [stats, setStats] = useState({ totalArsip: 0, totalBox: 0, totalNominal: 0 });
    const [barChartArsip, setBarChartArsip] = useState([]);
    const [barChartBox, setBarChartBox] = useState([]);
    const [lineChartUpload, setLineChartUpload] = useState([]);
    const [pieArsip, setPieArsip] = useState([]);
    const [pieBox, setPieBox] = useState([]);
    const [recentArsip, setRecentArsip] = useState([]);
    const [recentBoxes, setRecentBoxes] = useState([]);

    const COLORS_ARSIP_PIE = ['#3730a3', '#4f46e5', '#818cf8', '#c7d2fe']; 
    const COLORS_BOX_PIE = ['#1e3a8a', '#1d4ed8', '#3b82f6', '#7dd3fc', '#e0f2fe']; 

    const MONTHS_LIST = [
        { val: '1', label: 'Jan' }, { val: '2', label: 'Feb' }, { val: '3', label: 'Mar' },
        { val: '4', label: 'Apr' }, { val: '5', label: 'Mei' }, { val: '6', label: 'Jun' },
        { val: '7', label: 'Jul' }, { val: '8', label: 'Agu' }, { val: '9', label: 'Sep' },
        { val: '10', label: 'Okt' }, { val: '11', label: 'Nov' }, { val: '12', label: 'Des' }
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                const [resArsip, resBoxes] = await Promise.all([api.get('/arsip'), api.get('/boxes')]);
                const dataArsip = Array.isArray(resArsip.data) ? resArsip.data : resArsip.data.data || [];
                const dataBoxes = Array.isArray(resBoxes.data) ? resBoxes.data : resBoxes.data.data || [];
                setRawArsip(dataArsip);
                setRawBoxes(dataBoxes);

                const extractYear = (d) => d ? new Date(d).getFullYear() : null;
                const uploadYears = [...new Set([...dataArsip.map(i => extractYear(i.created_at || i.updated_at)), ...dataBoxes.map(i => extractYear(i.created_at || i.updated_at))].filter(Boolean))].sort((a, b) => b - a);
                setAvailableUploadYears(uploadYears);
                if (uploadYears.length > 0) setFilters(prev => ({...prev, year: uploadYears[0].toString()}));

                if (user?.role === 'super_admin') {
                    try {
                        const resUsers = await api.get('/users');
                        setPegawaiCount(Array.isArray(resUsers.data) ? resUsers.data.length : resUsers.data.data.length);
                    } catch { setPegawaiCount('locked'); }
                } else { setPegawaiCount('locked'); }
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        loadInitialData();
    }, [user?.role]);

    useEffect(() => {
        if (rawArsip.length === 0 && rawBoxes.length === 0) return;

        const filterData = (dataArray) => {
            if (filters.timeFilter === 'semua') return dataArray;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

            return dataArray.filter(item => {
                const dateToUse = item.created_at || item.updated_at;
                if (!dateToUse) return false;
                const itemDate = new Date(dateToUse);

                if (filters.timeFilter === 'hari_ini') return itemDate.getTime() >= today;
                if (filters.timeFilter === 'kustom') {
                    const matchYear = filters.year ? itemDate.getFullYear().toString() === filters.year : true;
                    let matchMonth = true;
                    if (filters.monthStart || filters.monthEnd) {
                        const m = itemDate.getMonth() + 1;
                        const s = filters.monthStart ? parseInt(filters.monthStart) : parseInt(filters.monthEnd);
                        const e = filters.monthEnd ? parseInt(filters.monthEnd) : parseInt(filters.monthStart);
                        matchMonth = m >= Math.min(s, e) && m <= Math.max(s, e);
                    }
                    return matchYear && matchMonth;
                }
                return true;
            });
        };

        const fArsip = filterData(rawArsip);
        const fBoxes = filterData(rawBoxes);

        setStats({
            totalArsip: fArsip.length,
            totalBox: fBoxes.length,
            totalNominal: fArsip.reduce((sum, item) => sum + (Number(item.nominal) || 0), 0)
        });

        const getBarData = (data) => {
            const map = {};
            data.forEach(i => { map[i.tahun || 'N/A'] = (map[i.tahun || 'N/A'] || 0) + 1; });
            return Object.keys(map).map(k => ({ name: k, Total: map[k] })).sort((a,b) => a.name.localeCompare(b.name));
        };
        setBarChartArsip(getBarData(fArsip));
        setBarChartBox(getBarData(fBoxes));

        const monthCounts = {};
        MONTHS_LIST.forEach(m => monthCounts[m.val] = { name: m.label, Arsip: 0, Box: 0 });
        fArsip.forEach(i => {
            const m = new Date(i.created_at || i.updated_at).getMonth() + 1;
            if(monthCounts[m]) monthCounts[m].Arsip++;
        });
        fBoxes.forEach(i => {
            const m = new Date(i.created_at || i.updated_at).getMonth() + 1;
            if(monthCounts[m]) monthCounts[m].Box++;
        });
        setLineChartUpload(Object.values(monthCounts));

        let u100 = 0, u1B = 0, o1B = 0;
        fArsip.forEach(i => {
            const v = Number(i.nominal) || 0;
            if (v < 100000000) u100++; else if (v < 1000000000) u1B++; else o1B++;
        });
        setPieArsip([{ name: '< 100Jt', value: u100 }, { name: '100Jt-1M', value: u1B }, { name: '> 1M', value: o1B }].filter(d => d.value > 0));

        const kMap = {};
        fBoxes.forEach(b => { kMap[b.kode_klasifikasi || 'N/A'] = (kMap[b.kode_klasifikasi || 'N/A'] || 0) + 1; });
        setPieBox(Object.keys(kMap).map(key => ({ name: key, value: kMap[key] })));

        setRecentArsip([...fArsip].sort((a,b) => b.id - a.id).slice(0, 5));
        setRecentBoxes([...fBoxes].sort((a,b) => b.id - a.id).slice(0, 5));

    }, [filters, rawArsip, rawBoxes]);

    const formatIDR = (amount) => {
        if(amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(2)} M`;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-300 animate-pulse">MEMUAT STATISTIK...</div>;

    return (
        <div className="space-y-6 bg-white font-sans text-slate-800 w-full animate-in fade-in duration-500 pb-10">
            
            {/* 🔥 HEADER & FILTER SEJAJAR DI KANAN DALAM PILL PUTIH BESAR */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 mt-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none uppercase">Laporan Statistik</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Visualisasi data pendaftaran berkas dan kotak fisik bkad</p>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                    <ExportPdfDashboard targetId="area-laporan" />
                    
                    <button 
                        onClick={() => setIsFilterOpen(true)}
                        className={`w-full sm:w-auto px-5 py-2.5 flex items-center justify-center gap-2 border rounded-full text-xs font-bold transition-all shadow-sm outline-none ${
                            (filters.timeFilter !== 'semua') 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <i className="bi bi-funnel-fill"></i> 
                        Filter Data
                        {filters.timeFilter !== 'semua' && (
                            <span className="ml-1 flex items-center justify-center bg-indigo-600 text-white w-4 h-4 rounded-full text-[9px] font-black">
                                1
                            </span>
                        )}
                    </button>
                </div>

                <FilterStatistik 
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    currentFilters={filters}
                    onApply={setFilters}
                    availableYears={availableUploadYears}
                />
            </div>

            <div id="area-laporan" className="space-y-6 bg-white p-2 md:p-4 rounded-3xl -mx-2 md:-mx-4">
                
                {/* 1. KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                        { label: 'Arsip SP2D', val: stats.totalArsip, icon: 'bi-file-earmark-text', color: 'indigo' },
                        { label: 'Box Fisik', val: stats.totalBox, icon: 'bi-archive', color: 'blue' },
                        { label: 'Nilai Total', val: formatIDR(stats.totalNominal), icon: 'bi-wallet2', color: 'sky' },
                        { label: 'Pegawai', val: pegawaiCount, icon: 'bi-people', color: 'slate' }
                    ].map((card, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-full border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full bg-${card.color}-50 text-${card.color}-600 flex items-center justify-center flex-shrink-0`}>
                                <i className={`bi ${card.icon} text-lg`}></i>
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{card.label}</p>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight truncate leading-tight">
                                    {card.val === 'locked' ? <i className="bi bi-lock-fill text-slate-300"></i> : card.val}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🔥 2. DIAGRAM BATANG (TREN TAHUNAN DENGAN GARIS & LABEL) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Tren SP2D per Tahun</h3>
                        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest">Berdasarkan tahun anggaran dokumen</p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartArsip}>
                                    {/* 🔥 CartesianGrid dipertebal biar ramai */}
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="Total" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30}>
                                        {/* 🔥 Tambah LabelList biar muncul angkanya di atas batang */}
                                        <LabelList dataKey="Total" position="top" style={{ fill: '#4f46e5', fontSize: 10, fontWeight: 'black' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-left">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Tren Box per Tahun</h3>
                        <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest">Berdasarkan tahun fisik box</p>
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartBox}>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} allowDecimals={false} />
                                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}>
                                        <LabelList dataKey="Total" position="top" style={{ fill: '#3b82f6', fontSize: 10, fontWeight: 'black' }} />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 🔥 3. DIAGRAM GARIS (TREN AKTIVITAS UPLOAD DENGAN GARIS SILANG & TITIK DATA) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col text-left">
                    <h3 className="text-sm font-bold text-slate-800 mb-1">Tren Aktivitas Upload Bulanan</h3>
                    <p className="text-[10px] text-slate-400 mb-6 uppercase tracking-widest">Intensitas penginputan data ke sistem bkad</p>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={lineChartUpload}>
                                <defs>
                                    <linearGradient id="colorArsip" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                                    <linearGradient id="colorBox" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                                </defs>
                                {/* 🔥 CartesianGrid dibuat silang (vertical true) & dipertebal biar ramai */}
                                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                
                                {/* 🔥 Tambah titik data (dot) dan label angka biar ramai */}
                                <Area type="monotone" dataKey="Arsip" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorArsip)" dot={{ r: 4, strokeWidth: 2, fill: 'white' }}>
                                    <LabelList dataKey="Arsip" position="top" offset={10} style={{ fill: '#4f46e5', fontSize: 9, fontWeight: 'bold' }} />
                                </Area>
                                <Area type="monotone" dataKey="Box" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorBox)" dot={{ r: 4, strokeWidth: 2, fill: 'white' }}>
                                    <LabelList dataKey="Box" position="top" offset={10} style={{ fill: '#0ea5e9', fontSize: 9, fontWeight: 'bold' }} />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. PIE CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col text-left">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Sebaran Nilai SP2D</h3>
                        <div className="h-[220px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieArsip} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {pieArsip.map((entry, index) => <Cell key={index} fill={COLORS_ARSIP_PIE[index % COLORS_ARSIP_PIE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-800">{stats.totalArsip}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Dokumen</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col text-left">
                        <h3 className="text-sm font-bold text-slate-800 mb-1">Klasifikasi Box Fisik</h3>
                        <div className="h-[220px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieBox} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {pieBox.map((entry, index) => <Cell key={index} fill={COLORS_BOX_PIE[index % COLORS_BOX_PIE.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-slate-800">{stats.totalBox}</span>
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Total Box</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. RECENT ACTIVITY */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left">
                        <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-800 uppercase">SP2D Masuk Terakhir</h3>
                            <button onClick={() => navigate('/arsip')} className="text-[10px] font-bold text-indigo-600 hover:underline outline-none">Lihat Semua</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentArsip.map((item) => (
                                <div key={item.id} className="p-3 px-5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/show-arsip/${item.id}`)}>
                                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0"><i className="bi bi-file-earmark-text text-sm"></i></div>
                                    <div className="truncate"><p className="text-[13px] font-bold text-slate-700 truncate">{item.no_surat}</p><p className="text-[10px] text-slate-400 truncate">{item.keperluan || 'Tanpa Keterangan'}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col text-left">
                        <div className="px-5 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xs font-bold text-slate-800 uppercase">Box Terdaftar Terakhir</h3>
                            <button onClick={() => navigate('/boxes')} className="text-[10px] font-bold text-blue-600 hover:underline outline-none">Lihat Semua</button>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {recentBoxes.map((box) => (
                                <div key={box.id} className="p-3 px-5 flex items-center gap-3 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/show-box/${box.id}`)}>
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0"><i className="bi bi-archive text-sm"></i></div>
                                    <div className="truncate"><p className="text-[13px] font-bold text-slate-700 truncate">{box.nomor_box}</p><p className="text-[10px] text-slate-400 truncate">Rak {box.nama_rak} - Sekat {box.nomor_rak}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    );
}