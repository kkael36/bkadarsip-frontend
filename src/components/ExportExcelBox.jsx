import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export default function ExportExcelBox({ data }) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert("Tidak ada data untuk diekspor!");
            return;
        }

        // 1. SIAPKAN STRUKTUR BARIS 
        const wsData = [
            [
                "No", "Nomor Box", "Tahun", "Kode Klasifikasi", 
                "Nama Rak (Zona)", "Nomor Rak (Urutan)", "Keterangan"
            ]
        ];

        // 2. MASUKKAN DATA
        data.forEach((item, index) => {
            wsData.push([
                index + 1,
                item.nomor_box || "-",
                item.tahun || "-",
                item.kode_klasifikasi || "-",
                item.nama_rak || "-",
                item.nomor_rak || "-",
                item.keterangan || "-"
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // 3. STYLING (Simple Professional)
        const headerStyle = {
            font: { bold: true, color: { rgb: "1F2937" } },
            fill: { fgColor: { rgb: "F3F4F6" } },
            alignment: { vertical: "center", horizontal: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "D1D5DB" } },
                bottom: { style: "thin", color: { rgb: "D1D5DB" } },
                left: { style: "thin", color: { rgb: "D1D5DB" } },
                right: { style: "thin", color: { rgb: "D1D5DB" } }
            }
        };

        const dataStyle = {
            alignment: { vertical: "center", horizontal: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "E5E7EB" } },
                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                left: { style: "thin", color: { rgb: "E5E7EB" } },
                right: { style: "thin", color: { rgb: "E5E7EB" } }
            }
        };

        // Aplikasikan style ke setiap sel
        for (let cell in worksheet) {
            if (cell.startsWith('!')) continue;
            const rowNum = parseInt(cell.replace(/[^0-9]/g, ''), 10);
            
            if (rowNum === 1) {
                worksheet[cell].s = headerStyle;
            } else {
                worksheet[cell].s = dataStyle;
            }
        }

        // Atur Lebar Kolom
        worksheet['!cols'] = [
            { wch: 5 },  // No
            { wch: 15 }, // Nomor Box
            { wch: 10 }, // Tahun
            { wch: 20 }, // Kode Klas
            { wch: 20 }, // Nama Rak
            { wch: 20 }, // Nomor Rak
            { wch: 40 }, // Keterangan
        ];

        // 4. COMPILE & DOWNLOAD
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data Box");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(fileData, `Data-Box-${new Date().getFullYear()}.xlsx`);
    };

    return (
        <button
            onClick={handleExport}
            className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
        >
            <i className="bi bi-file-earmark-excel-fill text-lg leading-none"></i> Export
        </button>
    );
}