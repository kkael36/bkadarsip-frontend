import DaftarSp2d from '../components/DaftarSp2d';
import StatCards from '../components/StatCards'; // Import komponen baru
import { useAuth } from '../context/AuthContext';
import WelcomeBanner from '../components/WelcomeBanner';
import Statistik from '../components/Statistik';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700 slide-in-from-bottom-3 ">
            
            {/* 1. WELCOME BANNER */}
             <div className="animate-in fade-in duration-700 delay-100">
            <WelcomeBanner user={user} />
            </div>
            {/* 2. STATS SECTION */}
            <div className="animate-in fade-in duration-700 delay-100">
                <Statistik />
            </div>

           
            
            
        </div>
    );
}