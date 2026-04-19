import { useState, useEffect } from 'react';
import api from '../services/api';

export default function StatCards({ user }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/stats');
                setStats(response.data.data);
            } catch (err) {
                console.error("Gagal mengambil stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatIDR = (val) => new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(val || 0);

    const cards = [
        { label: 'Total Arsip', value: stats?.total_arsip || 0, icon: 'bi-collection' },
        { label: 'Terbit Bulan Ini', value: stats?.arsip_bulan_ini || 0, icon: 'bi-arrow-up-right' },
        { label: 'Total Anggaran', value: formatIDR(stats?.total_nominal || 0), icon: 'bi-wallet2' },
    ];

    if (user?.role === 'super_admin') {
        cards.push({ label: 'Total Pegawai', value: stats?.total_pegawai || 0, icon: 'bi-person-badge' });
    }

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-3xl border border-slate-50"></div>)}
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => (
                <div 
                    key={idx} 
                    className="bg-white px-5 py-4 rounded-3xl border border-slate-100 flex items-center gap-4 transition-all hover:border-blue-200 group"
                >
                    {/* Ikon Dibuat Lebih Kecil & Halus */}
                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                        <i className={`bi ${card.icon} text-base`}></i>
                    </div>

                    <div className="flex flex-col min-w-0">
                        {/* Label: Kecil, Tipis, Tracking Lebar */}
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">
                            {card.label}
                        </p>
                        {/* Value: Tajam, Bold tapi nggak bulky */}
                        <h4 className="text-base font-bold text-slate-700 tracking-tight truncate leading-none">
                            {card.value}
                        </h4>
                    </div>
                </div>
            ))}
        </div>
    );
}