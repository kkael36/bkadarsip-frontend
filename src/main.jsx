import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🔥 IMPORT LOGO DARI ASSETS
import logoFavicon from './assets/logoarsipv2.png'

/**
 * Komponen Helper untuk menyuntikkan Favicon ke index.html secara dinamis.
 * Karena file di src/assets diproses oleh bundler (Vite), 
 * kita perlu mengambil URL hasil prosesnya lalu memasukkannya ke tag <link>.
 */
const FaviconManager = () => {
  useEffect(() => {
    // Cari tag link rel icon yang sudah ada
    let link = document.querySelector("link[rel*='icon']");

    if (!link) {
      // Jika belum ada, buat tag baru
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      document.head.appendChild(link);
    }

    // Set href ke file yang sudah di-import
    link.href = logoFavicon;
  }, []);

  return null;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 🔥 Panggil Manager Favicon di sini */}
    <FaviconManager />
    <App />
  </StrictMode>,
)