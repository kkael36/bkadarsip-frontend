import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        const mainContainer = document.getElementById('area-scroll-utama');
        
        if (!mainContainer) return;

        // Ambil posisi scroll saat ini (di bawah)
        const startPosition = mainContainer.scrollTop;
        
        // Kalau posisinya sudah di atas (0), nggak perlu animasi
        if (startPosition === 0) return;

        // Durasi animasi (dalam milidetik). 500 = setengah detik. 
        // Bisa kamu ubah kalau mau lebih lambat/cepat.
        const duration = 500; 
        const startTime = performance.now();

        // Fungsi "Sihir" Animasi Frame-by-Frame (Anti-gagal di React)
        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            // Rumus Easing (Biar jalannya mulus: ngebut di tengah, ngerem pelan di akhir)
            const ease = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Terapkan posisi scroll baru tiap frame
            mainContainer.scrollTop = startPosition * (1 - ease);

            // Kalau waktunya belum habis, panggil lagi fungsinya
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll);
            }
        };

        // Mulai animasi
        requestAnimationFrame(animateScroll);

    }, [pathname]);

    return null;
}