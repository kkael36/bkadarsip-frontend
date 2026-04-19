import DashboardIllustration from '../assets/bgdashboard1.png';

export default function WelcomeBanner({ user }) {
    return (
        <div className="relative bg-indigo-50/40 rounded-[2.5rem] p-10 lg:p-14 overflow-hidden flex items-center border border-indigo-100/30">
            
            {/* BAGIAN TEKS */}
            <div className="relative z-10 max-w-sm lg:max-w-md">
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-800 tracking-tighter leading-none">
                    Hi, <span className="text-indigo-600">{user?.name?.split(' ')[0] || 'Admin'}</span>
                </h1>
                
                <p className="mt-4 text-slate-500 text-xs lg:text-sm font-medium leading-relaxed max-w-[300px]">
                    Selamat datang kembali. Mari selesaikan tugas pengarsipan Anda dengan efisien hari ini.
                </p>

                <div className="flex items-center gap-2 mt-6">
                    <span className="h-[1px] w-6 bg-indigo-200"></span>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em] leading-relaxed">
                        Sistem Arsip Digital <br/> BKAD Kota Bogor
                    </p>
                </div>
            </div>

            {/* BAGIAN FOTO: Overlap ke bawah */}
            <div className="hidden md:block absolute right-[-2%] lg:right-[8%] bottom-[-45px] z-20">
                <img 
                    src={DashboardIllustration}
                    alt="Illustration" 
                    className="h-60 lg:h-72 w-auto object-contain drop-shadow-2xl opacity-95" 
                />
            </div>

            {/* BACKGROUND DECOR */}
            <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-indigo-100/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[15%] w-40 h-40 bg-white/50 rounded-full blur-[60px]"></div>
        </div>
    );
}