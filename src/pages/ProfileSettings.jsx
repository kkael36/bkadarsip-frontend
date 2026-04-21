import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert'; 
import ConfirmModal from '../components/ConfirmModal'; 

// HELPER: Penanganan URL Gambar yang cerdas
const getProfileImageUrl = (photoPath) => {
    if (!photoPath) return null;
    // Jika sudah link lengkap (Cloudinary), pakai langsung
    if (photoPath.startsWith('http')) return photoPath;
    // Jika masih path pendek, arahkan ke backend Railway
    return `https://bkadarsip-backend-production.up.railway.app/storage/${photoPath}`;
};

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image(); image.src = imageSrc;
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    await new Promise((resolve) => { image.onload = resolve; });
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => { canvas.toBlob((blob) => { resolve(blob); }, 'image/jpeg'); });
};

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
                    className="w-12 h-14 border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white disabled:bg-slate-50"
                    value={data}
                    onChange={e => handleChange(e.target, index)}
                    onKeyDown={e => e.key === "Backspace" && !otp[index] && index > 0 && inputs.current[index - 1].focus()}
                />
            ))}
        </div>
    );
}

export default function ProfileSettings() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    
    const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
    
    const syncUser = (u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); };
    const showAlert = (message, type) => setAlertConfig({ show: true, message, type });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-6 font-sans text-slate-700 relative">
            
            {alertConfig.show && (
                <Alert 
                    message={alertConfig.message} 
                    type={alertConfig.type} 
                    onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
                />
            )}

            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm gap-4">
                <div className="text-left w-full md:w-auto">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase leading-none">Pengaturan Akun</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Identitas Pegawai & Pengamanan Data Internal</p>
                </div>
                
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-full md:w-auto bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 px-8 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm"
                >
                    Kembali
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                    <ProfilePhotoCard user={user} syncUser={syncUser} showAlert={showAlert} />
                    <GeneralInfoCard user={user} syncUser={syncUser} showAlert={showAlert} />
                </div>
                
                <div className="lg:col-span-7 space-y-6">
                    <EmailWizard showAlert={showAlert} />
                    <PasswordWizard showAlert={showAlert} />
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------
// 1. FOTO PROFIL (FIX URL HANDLING)
// ------------------------------------------
function ProfilePhotoCard({ user, syncUser, showAlert }) {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [px, setPx] = useState(null);

   const save = async () => {
    setLoading(true);
    try {
        const b = await getCroppedImg(image, px);
        const fd = new FormData(); 
        fd.append('photo', b, 'profile.jpg'); 
        fd.append('name', user.name);

        const res = await api.post('/user/update-general', fd, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        
        syncUser(res.data.user); 
        setShowModal(false);
        showAlert("Profil berhasil diperbarui!", "simpan");
    } catch (e) {
        console.error("Upload Error:", e.response);
        
        // Tampilkan pesan error lengkap dari backend
        const backendMessage = e.response?.data?.message;
        const errorMessage = backendMessage || "Gagal simpan profil.";
        
        showAlert(errorMessage, "hapus");
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="bg-white p-4 rounded-[2rem] border border-slate-50 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="relative inline-block mb-4">
                <div className="w-40 h-40 bg-indigo-600 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-sm flex items-center justify-center text-white text-5xl font-black">
                    {user?.photo_profile ? (
                        <img 
                            src={getProfileImageUrl(user.photo_profile)} 
                            className="w-full h-full object-cover" 
                            alt="avatar" 
                            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + user.name }}
                        />
                    ) : (
                        user?.name?.charAt(0).toUpperCase()
                    )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-3 rounded-xl cursor-pointer shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all border-[3px] border-white">
                    <i className="bi bi-camera-fill text-lg leading-none"></i>
                    <input type="file" className="hidden" accept="image/*" onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                            const r = new FileReader(); 
                            r.readAsDataURL(file);
                            r.onload = () => { setImage(r.result); setShowModal(true); };
                        }
                    }} />
                </label>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-2 uppercase">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="relative h-72 w-full">
                            <Cropper image={image} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, p) => setPx(p)} />
                        </div>
                        <div className="p-6 flex gap-4 items-center">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-colors">Batal</button>
                            <button disabled={loading} onClick={save} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                                {loading ? 'Memuat...' : 'Simpan Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ------------------------------------------
// 2. INFO NAMA
// ------------------------------------------
function GeneralInfoCard({ user, syncUser, showAlert }) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [showConfirm, setShowConfirm] = useState(false); 
    
    const save = async () => {
        setShowConfirm(false);
        setLoading(true);
        try { 
            const res = await api.post('/user/update-general', { name }); 
            syncUser(res.data.user); 
            showAlert("Nama lengkap berhasil diperbarui!", "simpan"); 
        } catch (e) { 
            showAlert("Gagal memperbarui nama.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm space-y-6">
            
            <ConfirmModal 
                show={showConfirm} 
                type="simpan" 
                message="Apakah Anda yakin ingin menyimpan perubahan nama lengkap ini?" 
                onConfirm={save} 
                onCancel={() => setShowConfirm(false)} 
            />

            <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-4 bg-indigo-600 rounded-full"></div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Informasi Dasar</span>
            </div>
            <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input disabled={loading} value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" />
            </div>
            <button 
                disabled={loading || name === user?.name} 
                onClick={() => setShowConfirm(true)} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
                {loading ? 'Menyimpan...' : 'Simpan Nama'}
            </button>
        </div>
    );
}

// ------------------------------------------
// 3. EMAIL WIZARD (DENGAN COOLDOWN)
// ------------------------------------------
function EmailWizard({ showAlert }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({ password: '', otp_old: '', new_email: '', otp_new: '' });

    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const storedTime = localStorage.getItem('emailOtpCooldown');
        if (storedTime) {
            const remaining = Math.floor((parseInt(storedTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
                setStep(2); 
            } else {
                localStorage.removeItem('emailOtpCooldown');
            }
        }
    }, []);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        localStorage.removeItem('emailOtpCooldown');
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

    const handleReq = async () => {
        setLoading(true);
        try { 
            await api.post('/user/request-email-change', { password: form.password }); 
            const expiryTime = Date.now() + (180 * 1000);
            localStorage.setItem('emailOtpCooldown', expiryTime.toString());
            setCooldown(180);
            setStep(2); 
            showAlert("Kode OTP berhasil dikirim ke email Anda.", "simpan");
        } catch (e) { 
            showAlert("Password yang Anda masukkan salah!", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleVerifyOld = async (otp) => {
        setLoading(true);
        try {
            await api.post('/user/verify-old-email-otp', { otp_old: otp });
            setForm({ ...form, otp_old: otp });
            setStep(3);
        } catch (e) { 
            showAlert("Kode OTP verifikasi tidak valid.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleReqNew = async () => {
        if (!form.new_email) return showAlert("Harap isi alamat email baru terlebih dahulu.", "hapus");
        setLoading(true);
        try { 
            await api.post('/user/request-new-email-otp', { new_email: form.new_email }); 
            setStep(4); 
        } catch (e) { 
            showAlert(e.response?.data?.message || "Email tersebut sudah digunakan.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm">
            <div className="flex justify-between items-center mb-6 text-left border-b border-slate-50 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Ubah Alamat Email</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">Tahap {step}/4: Verifikasi</p>
                    </div>
                </div>
                <div className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full uppercase tracking-widest border border-indigo-100/50">Ganti Email</div>
            </div>

            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <div className="relative text-left flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password Akun</label>
                        <input type={showPass ? "text" : "password"} placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 pr-12" />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"><i className={showPass ? "bi bi-eye-slash" : "bi bi-eye"}></i></button>
                    </div>
                    
                    {cooldown > 0 ? (
                        <div className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] text-center border border-slate-200">
                            Kirim Ulang Dalam {formatTime(cooldown)}
                        </div>
                    ) : (
                        <button disabled={loading || !form.password} onClick={handleReq} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                            {loading ? 'Memuat...' : 'Mulai Proses'}
                        </button>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="text-center animate-in slide-in-from-right-4">
                    <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase">Kode OTP Email Lama:</p>
                    <OtpInputField disabled={loading} onComplete={handleVerifyOld} />
                    
                    {cooldown > 0 ? (
                        <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest">
                            KIRIM ULANG KODE DALAM <span className="text-indigo-600">{formatTime(cooldown)}</span>
                        </p>
                    ) : (
                        <button onClick={handleReq} disabled={loading} className="text-[10px] font-bold text-indigo-600 hover:underline mb-4 tracking-widest uppercase transition-all block mx-auto">
                            Kirim Ulang Kode OTP
                        </button>
                    )}

                    <button onClick={() => { setStep(1); setForm({...form, password: ''}); }} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors tracking-widest">Batal</button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 text-left animate-in slide-in-from-right-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Email Baru</label>
                        <input placeholder="nama@bogor.go.id" onChange={e => setForm({...form, new_email: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" />
                    </div>
                    <button disabled={loading} onClick={handleReqNew} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                        {loading ? 'Memuat...' : 'Kirim Kode Verifikasi'}
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="text-center animate-in slide-in-from-right-4">
                    <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase">Kode OTP Email Baru:</p>
                    <OtpInputField disabled={loading} onComplete={async (otp) => {
                        setLoading(true);
                        try { 
                            await api.post('/user/finalize-email', { otp_new: otp }); 
                            showAlert("Alamat email berhasil diubah!", "simpan"); 
                            setTimeout(() => { window.location.reload(); }, 1500);
                        } catch(e) { 
                            showAlert("Kode OTP untuk email baru salah!", "hapus"); 
                        } finally { 
                            setLoading(false); 
                        }
                    }} />
                    <button onClick={() => setStep(3)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors tracking-widest">Ganti Email Baru</button>
                </div>
            )}
        </div>
    );
}

// ------------------------------------------
// 4. PASSWORD WIZARD (DENGAN COOLDOWN)
// ------------------------------------------
function PasswordWizard({ showAlert }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showN, setShowN] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false); 
    const [form, setForm] = useState({ otp: '', password: '', password_confirmation: '' });

    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        const storedTime = localStorage.getItem('pwdOtpCooldown');
        if (storedTime) {
            const remaining = Math.floor((parseInt(storedTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
                setStep(2); 
            } else {
                localStorage.removeItem('pwdOtpCooldown');
            }
        }
    }, []);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        localStorage.removeItem('pwdOtpCooldown');
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

    const handleReqPwdOtp = async () => {
        setLoading(true);
        try { 
            await api.post('/user/request-password-otp'); 
            const expiryTime = Date.now() + (180 * 1000);
            localStorage.setItem('pwdOtpCooldown', expiryTime.toString());
            setCooldown(180);
            setStep(2); 
            showAlert("Kode OTP berhasil dikirim ke email.", "simpan");
        } catch (e) { 
            showAlert("Gagal mengirim kode OTP ke email.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleVerifyOtp = async (otp) => {
        setLoading(true);
        try { 
            await api.post('/user/verify-password-otp', { otp }); 
            setForm({...form, otp}); 
            setStep(3); 
        } catch (e) { 
            showAlert("Kode OTP verifikasi sandi salah.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    const executeUpdatePassword = async () => {
        setShowConfirm(false);
        setLoading(true);
        try { 
            await api.post('/user/update-password', form); 
            showAlert("Kata sandi berhasil diperbarui!", "simpan"); 
            setStep(1); 
            setForm({ otp: '', password: '', password_confirmation: '' });
        } catch (e) { 
            showAlert("Gagal memperbarui kata sandi. Pastikan kombinasi sesuai.", "hapus"); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-50 shadow-sm">
            
            <ConfirmModal 
                show={showConfirm} 
                type="simpan" 
                message="Apakah Anda yakin ingin memperbarui dan mengganti kata sandi akun Anda?" 
                onConfirm={executeUpdatePassword} 
                onCancel={() => setShowConfirm(false)} 
            />

            <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
                <h4 className="text-sm font-bold text-slate-800">Keamanan Kata Sandi</h4>
            </div>
            
            {step === 1 && (
                <div className="bg-slate-50/50 p-6 rounded-[1.5rem] flex flex-col sm:flex-row justify-between items-center border border-slate-100 gap-4">
                    <p className="text-[11px] text-slate-500 font-medium text-left leading-relaxed">Ganti sandi via verifikasi OTP email agar lebih aman.</p>
                    
                    {cooldown > 0 ? (
                        <div className="w-full sm:w-auto bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest shadow-sm text-center">
                            {formatTime(cooldown)}
                        </div>
                    ) : (
                        <button disabled={loading} onClick={handleReqPwdOtp} className="w-full sm:w-auto bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-bold text-slate-700 uppercase tracking-widest shadow-sm hover:bg-slate-100 transition-colors outline-none">
                            {loading ? '...' : 'Request OTP'}
                        </button>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="text-center animate-in zoom-in-95">
                    <p className="text-[11px] text-slate-400 mb-2 font-semibold uppercase">Masukkan OTP Email:</p>
                    <OtpInputField disabled={loading} onComplete={handleVerifyOtp} />
                    
                    {cooldown > 0 ? (
                        <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest">
                            KIRIM ULANG KODE DALAM <span className="text-amber-500">{formatTime(cooldown)}</span>
                        </p>
                    ) : (
                        <button onClick={handleReqPwdOtp} disabled={loading} className="text-[10px] font-bold text-amber-500 hover:underline mb-4 tracking-widest uppercase transition-all block mx-auto">
                            Kirim Ulang Kode OTP
                        </button>
                    )}

                    <button onClick={() => setStep(1)} className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase transition-colors tracking-widest">Batal</button>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6 text-left animate-in zoom-in-95">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sandi Baru</label>
                            <input disabled={loading} type={showN ? "text" : "password"} placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300 pr-12" />
                            <button onClick={() => setShowN(!showN)} className="absolute right-4 top-[65%] -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"><i className={showN ? "bi bi-eye-slash" : "bi bi-eye"}></i></button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi</label>
                            <input disabled={loading} type="password" placeholder="••••••••" onChange={e => setForm({...form, password_confirmation: e.target.value})} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-300" />
                        </div>
                    </div>
                    <button 
                        disabled={loading || !form.password || !form.password_confirmation} 
                        onClick={() => setShowConfirm(true)} 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Memproses...' : 'Perbarui Sandi'}
                    </button>
                </div>
            )}
        </div>
    );
}