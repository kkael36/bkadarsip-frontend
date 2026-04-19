import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoArsip from '../assets/logoarsipv2.png';
import bgLogin from '../assets/bglogin.png';
import logoBkad from '../assets/logobkad.png'
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ==========================================
// KOMPONEN OTP INPUT (DARI PROFILE)
// ==========================================
function OtpInputField({ length = 6, onComplete, disabled }) {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otp.map((d, idx) => (idx === index ? element.value : d))];
        setOtp(newOtp);
        if (element.nextSibling && element.value !== "") element.nextSibling.focus();
        if (newOtp.join("").length === length) onComplete(newOtp.join(""));
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").trim();
        if (isNaN(data) || data.length < length) return;
        const pasteData = data.split("").slice(0, length);
        setOtp(pasteData);
        onComplete(pasteData.join(""));
    };

    return (
        <div className="flex justify-center gap-2 my-6">
            {otp.map((data, index) => (
                <input
                    key={index}
                    ref={el => inputs.current[index] = el}
                    type="text"
                    maxLength="1"
                    disabled={disabled}
                    onPaste={handlePaste}
                    className="w-10 h-12 border border-slate-200 rounded-lg text-center text-lg font-semibold text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 outline-none transition-all bg-white disabled:bg-slate-50"
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => e.key === "Backspace" && !otp[index] && index > 0 && inputs.current[index - 1].focus()}
                />
            ))}
        </div>
    );
}

export default function Login() {
    // State Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // 🔥 State Ingat Saya

    // State Reset Password Flow
    const [mode, setMode] = useState('login'); // login, forgot, otp, new-password
    const [otp, setOtpValue] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 🔥 State Cooldown
    const [cooldown, setCooldown] = useState(0);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    // 🔥 Effect untuk Cek Remember Me & Cooldown saat Mount
    useEffect(() => {
        // 1. Logika Remember Me
        const savedEmail = localStorage.getItem('remember_email');
        const savedPass = localStorage.getItem('remember_password');
        if (savedEmail && savedPass) {
            setEmail(savedEmail);
            setPassword(savedPass);
            setRememberMe(true);
        }

        // 2. Logika Cooldown & Anti-Refresh
        const storedTime = localStorage.getItem('loginOtpCooldown');
        if (storedTime) {
            const remaining = Math.floor((parseInt(storedTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
                if (mode === 'forgot' || mode === 'login') setMode('otp');
            } else {
                localStorage.removeItem('loginOtpCooldown');
            }
        }
    }, []);

    // 🔥 Timer Interval Cooldown
    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        localStorage.removeItem('loginOtpCooldown');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // --- LOGIC LOGIN ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.post('/login', { email, password });
            
            if (data.user.status === 'inactive' || data.user.is_active === 0) {
                setError('Akun Anda dinonaktifkan. Silakan hubungi admin.');
                return;
            }

            // 🔥 Simpan ke localStorage jika "Ingat Saya" dicentang
            if (rememberMe) {
                localStorage.setItem('remember_email', email);
                localStorage.setItem('remember_password', password);
            } else {
                localStorage.removeItem('remember_email');
                localStorage.removeItem('remember_password');
            }

            login(data.user, data.token); 
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Akses ditolak. Cek email & password.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- LOGIC RESET PASSWORD ---
    const handleRequestOtp = async (e) => {
        if (e) e.preventDefault();
        if (cooldown > 0) return;

        setIsLoading(true);
        setError('');
        try {
            await api.post('/forgot-password/request', { email });
            
            // 🔥 Set Cooldown 3 Menit
            const expiryTime = Date.now() + (180 * 1000);
            localStorage.setItem('loginOtpCooldown', expiryTime.toString());
            setCooldown(180);

            setMode('otp');
        } catch (err) {
            setError(err.response?.data?.message || 'Email tidak terdaftar.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (otpValue) => {
        setIsLoading(true);
        setError('');
        try {
            await api.post('/forgot-password/verify', { email, otp: otpValue });
            setOtpValue(otpValue); 
            setMode('new-password');
        } catch (err) {
            setError(err.response?.data?.message || 'OTP salah atau kedaluwarsa.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Konfirmasi password tidak cocok.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await api.post('/forgot-password/reset', { 
                email, 
                otp, 
                password: newPassword,
                password_confirmation: confirmPassword 
            });
            alert('Password berhasil diperbarui! Silakan login.');
            localStorage.removeItem('loginOtpCooldown');
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white md:bg-[#F9FAFB] flex items-center justify-center p-4 font-sans antialiased">
            <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                
                {/* SISI KIRI: Form Area */}
                <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
                    <div className="max-w-[300px] mx-auto w-full">
                        
                        <div className="mb-8 text-left">
                            <div className="flex items-center gap-3 mb-6">
                                {/* 🔥 DUA LOGO SEJAJAR */}
                                <div className="w-16 h-16 bg-blue-700 rounded-lg flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                                    <img src={logoArsip} alt="Logo Arsip" className="h-14 w-auto object-contain" />
                                </div>
                                <div className="w-20 h-20 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                                    <img src={logoBkad} alt="Logo Instansi" className="h-16 w-auto object-contain" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {mode === 'login' ? 'Selamat Datang!' : mode === 'otp' ? 'Verifikasi OTP' : 'Reset Password'}
                            </h2>
                            <p className="text-slate-400 text-[11px] mt-1 font-semibold uppercase tracking-widest">
                                {mode === 'login' ? 'Arsip Digital BKAD' : 'Ikuti langkah pemulihan'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 text-[11px] text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-center font-bold animate-in fade-in zoom-in-95">
                                {error}
                            </div>
                        )}

                        {/* --- FORM LOGIN --- */}
                        {mode === 'login' && (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1.5 block tracking-wider">Email</label>
                                    <input type="email" value={email} placeholder="nama@bogor.go.id" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-700 transition-all text-slate-700" onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1.5 block tracking-wider">Password</label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={password} placeholder="••••••••" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-700 transition-all text-slate-700 pr-10" onChange={e => setPassword(e.target.value)} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-700 focus:outline-none">
                                            {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-3">
                                        {/* 🔥 OPSI INGAT SAYA */}
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 border-slate-300 rounded text-blue-700 focus:ring-blue-600 cursor-pointer" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-slate-600 transition-colors">Ingat Saya</span>
                                        </label>
                                        <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Lupa Password?</button>
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-md mt-4 hover:bg-blue-800 transition-all active:scale-[0.98] disabled:opacity-50 tracking-widest uppercase">
                                    {isLoading ? 'memuat...' : 'Login'}
                                </button>
                            </form>
                        )}

                        {/* --- STEP 1: INPUT EMAIL --- */}
                        {mode === 'forgot' && (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div className="text-left">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1.5 block tracking-wider">Masukkan Email Akun</label>
                                    <input type="email" value={email} placeholder="nama@bogor.go.id" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-700 text-slate-700" onChange={e => setEmail(e.target.value)} />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-md hover:bg-blue-800 transition-all uppercase tracking-widest">
                                    {isLoading ? 'Mengirim...' : 'Kirim OTP'}
                                </button>
                                <button type="button" onClick={() => setMode('login')} className="w-full text-[10px] font-bold text-slate-400 uppercase hover:text-blue-700 tracking-wider">Kembali ke Login</button>
                            </form>
                        )}

                        {/* --- STEP 2: INPUT OTP (WITH COOLDOWN LOGIC) --- */}
                        {mode === 'otp' && (
                            <div className="text-center animate-in slide-in-from-right-4">
                                <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase tracking-wider">Masukkan Kode OTP (Cek Email):</p>
                                <OtpInputField disabled={isLoading} onComplete={handleVerifyOtp} />
                                
                                {cooldown > 0 ? (
                                    <p className="text-[10px] font-bold text-slate-400 mb-6 tracking-widest uppercase">
                                        Kirim ulang dalam <span className="text-blue-700">{formatTime(cooldown)}</span>
                                    </p>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleRequestOtp} 
                                        disabled={isLoading}
                                        className="text-[10px] font-bold text-blue-600 mb-6 uppercase underline tracking-widest block mx-auto"
                                    >
                                        Kirim Ulang Kode OTP
                                    </button>
                                )}

                                <button type="button" onClick={() => { setMode('forgot'); localStorage.removeItem('loginOtpCooldown'); }} className="text-[10px] font-bold text-slate-300 uppercase underline tracking-widest">Ganti Email</button>
                            </div>
                        )}

                        {/* --- STEP 3: NEW PASSWORD --- */}
                        {mode === 'new-password' && (
                            <form onSubmit={handleUpdatePassword} className="space-y-4 animate-in slide-in-from-right-4">
                                <div className="text-left">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1.5 block tracking-wider">Password Baru</label>
                                    <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-700 text-slate-700" onChange={e => setNewPassword(e.target.value)} />
                                </div>
                                <div className="text-left">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1 mb-1.5 block tracking-wider">Konfirmasi Password</label>
                                    <input type="password" placeholder="••••••••" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-700 text-slate-700" onChange={e => setConfirmPassword(e.target.value)} />
                                </div>
                                <button type="submit" disabled={isLoading} className="w-full bg-blue-700 text-white text-xs font-bold py-3 px-4 rounded-md hover:bg-blue-800 transition-all uppercase tracking-widest">
                                    {isLoading ? 'Menyimpan...' : 'Simpan Password'}
                                </button>
                            </form>
                        )}

                        <div className="mt-10 text-center">
                            <p className="text-[12px] text-slate-400 font-bold uppercase tracking-tighter">© 2026 BKAD Kota Bogor</p>
                        </div>
                    </div>
                </div>

                {/* SISI KANAN: Visual Section (Tetap Sama) */}
                <div className="hidden md:flex w-1/2 bg-white p-4 border-l border-slate-100">
                    <div className="relative w-full h-full bg-white rounded-2xl p-2 border border-slate-200/60">
                        <div className="relative h-full w-full rounded-[14px] overflow-hidden">
                            <img src={bgLogin} alt="Visual" className="absolute inset-0 w-full h-full object-cover grayscale-[20%] opacity-90" />
                            <div className="relative h-full flex flex-col justify-end p-10">
                                <div className="max-w-[280px] mx-auto text-center">
                                     <h3 className="text-xl font-bold text-slate-800 leading-tight">Kerja lebih rapih dengan <span className="text-blue-700">Arsip Digital</span></h3>
                                     <p className="text-[14px] text-slate-500 mt-3 font-medium">Sistem pengelolaan dokumen yang efisien untuk BKAD Kota Bogor.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}