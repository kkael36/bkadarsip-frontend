import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExportPdfDashboard({ targetId, fileName = 'Laporan_Statistik_BKAD' }) {
    const [isPrinting, setIsPrinting] = useState(false);

    const generatePDF = async () => {
        const element = document.getElementById(targetId);
        if (!element) {
            alert("Area laporan tidak ditemukan!");
            return;
        }

        setIsPrinting(true);
        try {
            // 1. Ambil foto elemen HTML (scale: 2 biar resolusinya HD dan teksnya tajam)
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#f8fafc' // Warna background slate-50 biar senada
            });

            const imgData = canvas.toDataURL('image/png');
            
            // 2. Siapkan kertas A4 (Portrait)
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // 3. Logika agar PDF otomatis bikin halaman baru kalau kontennya panjang
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
            }

            // 4. Download file
            pdf.save(`${fileName}_${new Date().toISOString().slice(0,10)}.pdf`);
        } catch (error) {
            console.error("Gagal mencetak PDF:", error);
            alert("Terjadi kesalahan saat memproses PDF.");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <button
            onClick={generatePDF}
            disabled={isPrinting}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            title="Cetak tampilan statistik ini menjadi PDF"
        >
            {isPrinting ? (
                <><i className="bi bi-arrow-repeat animate-spin text-sm"></i> Memproses PDF...</>
            ) : (
                <><i className="bi bi-file-earmark-pdf-fill text-sm"></i> Cetak Laporan PDF</>
            )}
        </button>
    );
}