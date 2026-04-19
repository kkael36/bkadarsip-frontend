import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export default function ExportExcel({ data }) {
    const handleExport = () => {
        if (!data || data.length === 0) {
            alert("Tidak ada data untuk diekspor!");
            return;
        }

        // 🔥 Fungsi format angka diubah agar otomatis menambahkan "Rp. "
        const formatNumber = (num) => {
            if (!num) return "-";
            const formattedNum = new Intl.NumberFormat('id-ID').format(num);
            return `Rp. ${formattedNum}`; // Tambahkan prefix Rp. di sini
        };

        const wsData = [
            [
                "No", "Kode Klas", "No Surat", "Uraian Informasi Arsip", 
                "Nominal", "Lampiran", "Unit Pencipta", "Tahun", "Jumlah", "No Box Sementara", // Header "Nominal" saya buat simpel
                "Tingkat Pengembangan", "No Box Permanen", "Kondisi", 
                "JRA", "", 
                "Nasib Akhir", "Rekomendasi", "Ket"
            ],
            [
                "", "", "", "", 
                "", "", "", "", "", "", 
                "", "", "", 
                "Aktif", "Inaktif", 
                "", "", ""
            ]
        ];

        data.forEach((item, index) => {
            wsData.push([
                index + 1,
                item.kode_klas || "-",
                item.no_surat || "-",
                item.keperluan || "-", 
                item.nominal ? formatNumber(item.nominal) : "-", // 🔥 Panggil fungsi formatNumber yang baru
                item.terlampir || "-", 
                item.unit_pencipta || "-",
                item.tahun || "-",
                item.jumlah || "-",
                item.no_box_sementara || "-",
                item.tingkat_pengembangan || "-",
                item.no_box_permanen || "-",
                item.kondisi || "-",
                item.jra_aktif ? `${item.jra_aktif} thn` : "-",
                item.jra_inaktif ? `${item.jra_inaktif} thn` : "-",
                item.nasib_akhir || "-",
                item.rekomendasi || "-",
                item.keterangan || "-"
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(wsData);

        // MERGE CELLS
        worksheet['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },   // No
            { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },   // Kode Klas
            { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },   // No Surat
            { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },   // Uraian
            { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },   // Nominal
            { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },   // Lampiran
            { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },   // Unit Pencipta
            { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },   // Tahun
            { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },   // Jumlah
            { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },   // No Box Sementara
            { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } }, // Tingkat Pengembangan
            { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } }, // No Box Permanen
            { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } }, // Kondisi
            { s: { r: 0, c: 13 }, e: { r: 0, c: 14 } }, // JRA (Atasnya nge-merge Aktif & Inaktif)
            { s: { r: 0, c: 15 }, e: { r: 1, c: 15 } }, // Nasib Akhir
            { s: { r: 0, c: 16 }, e: { r: 1, c: 16 } }, // Rekomendasi
            { s: { r: 0, c: 17 }, e: { r: 1, c: 17 } }, // Ket
        ];

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

        for (let cell in worksheet) {
            if (cell.startsWith('!')) continue;
            const rowNum = parseInt(cell.replace(/[^0-9]/g, ''), 10);
            
            if (rowNum === 1 || rowNum === 2) {
                worksheet[cell].s = headerStyle;
            } else {
                worksheet[cell].s = dataStyle;
            }
        }

        worksheet['!cols'] = [
            { wch: 5 },  // 0: No
            { wch: 15 }, // 1: Kode Klas
            { wch: 25 }, // 2: No Surat
            { wch: 50 }, // 3: Uraian
            { wch: 20 }, // 4: Nominal
            { wch: 15 }, // 5: Lampiran
            { wch: 30 }, // 6: Unit Pencipta
            { wch: 8 },  // 7: Tahun
            { wch: 12 }, // 8: Jumlah
            { wch: 15 }, // 9: No Box Sementara
            { wch: 20 }, // 10: Tkt Pengembangan
            { wch: 15 }, // 11: No Box Permanen
            { wch: 12 }, // 12: Kondisi
            { wch: 10 }, // 13: JRA Aktif
            { wch: 10 }, // 14: JRA Inaktif
            { wch: 20 }, // 15: Nasib Akhir
            { wch: 20 }, // 16: Rekomendasi
            { wch: 20 }, // 17: Ket
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data SP2D");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const fileData = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(fileData, `Arsip-SP2D-${new Date().getFullYear()}.xlsx`);
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